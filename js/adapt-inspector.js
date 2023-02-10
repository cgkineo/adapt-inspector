define([ 'core/js/adapt' ], function(Adapt) {

  const InspectorView = Backbone.View.extend({

    className: 'inspector',

    ids: [],

    initialize: function() {
      this.listenTo(Adapt, {
        'inspector:id': this.pushId,
        'inspector:hover': this.setVisibility,
        'inspector:touch': this.updateInspector,
        'device:resize': this.onResize,
        remove: this.remove
      }).render();
    },

    events: {
      mouseleave: 'onLeave'
    },

    render: function() {
      $('#wrapper').append(this.$el);
    },

    pushId: function(id) {
      this.ids.push(id);
    },

    setVisibility: function() {
      if (this.$el.is(':hover')) return;

      for (let i = this.ids.length - 1; i >= 0; --i) {
        const $hovered = $("[data-adapt-id='" + this.ids[i] + "']:hover");

        if ($hovered.length) return this.updateInspector($hovered);
      }

      $('.inspector-visible').removeClass('inspector-visible');
      this.$el.hide();
    },

    updateInspector: function($hovered) {
      const $previous = $('.inspector-visible');

      if ($hovered.is($previous.last())) return;

      const data = [];
      const template = Handlebars.templates.inspector;

      $previous.removeClass('inspector-visible');

      this.addOverlappedElements($hovered).each(function() {
        const $element = $(this);
        const attributes = $element.data().attributes;

        if (!attributes) return;

        data.push(attributes);
        $element.addClass('inspector-visible');
      });

      this.$el.html(template(data)).removeAttr('style').removeClass('inline');

      const offset = $hovered.offset();
      const offsetTop = offset.top;
      const targetTop = offsetTop - this.$el.outerHeight();
      const shouldBeInline = targetTop < 0;

      this.$el.css({
        top: shouldBeInline ? offsetTop : targetTop,
        left: offset.left + $hovered.outerWidth() / 2 - this.$el.width() / 2
      }).toggleClass('inline', shouldBeInline);
    },

    addOverlappedElements: function($hovered) {
      const checkOverlap = function() {
        const $element = $(this);

        const isOverlapped = $element.height() && _.isEqual($element.offset(), $hovered.offset()) && $element.width() === $hovered.width();

        if (isOverlapped) $hovered = $hovered.add($element);
      };

      for (let i = this.ids.length - 1; i >= 0; --i) {
        $("[data-adapt-id='" + this.ids[i] + "']").each(checkOverlap);
      }

      return $hovered;
    },

    onResize: function() {
      const $hovered = $('.inspector-visible');

      if (!$hovered.length) return;

      $hovered.removeClass('inspector-visible');
      this.updateInspector($hovered.last());
    },

    onLeave: function() {
      _.defer(this.setVisibility.bind(this));
    }

  });

  const InspectorContainerView = Backbone.View.extend({

    initialize: function() {
      const id = this.model.get('_id');

      this.listenTo(Adapt, 'remove', this.remove).addTracUrl(id);
      this.$el.data(this.model);
      Adapt.trigger('inspector:id', id);
    },

    events: {
      mouseenter: 'onHover',
      mouseleave: 'onHover',
      touchend: 'onTouch'
    },

    addTracUrl: function(id) {
      const config = Adapt.config.get('_inspector')._trac;

      if (!config || !config._isEnabled) return;

      const params = config._params || {
        summary: '{{_id}}{{#if displayTitle}} {{{displayTitle}}}{{/if}}{{inspector_location}}'
      };

      const $div = $('<div>');
      const data = this.model.toJSON();
      let tracUrl = config._url + '/newticket?';

      for (const key in params) {
        if (!Object.prototype.hasOwnProperty.call(params, key)) continue;

        const value = $div.html(Handlebars.compile(params[key])(data)).text();

        tracUrl += '&' + key + '=' + encodeURIComponent(value);
      }

      this.model.set('_tracUrl', tracUrl);
    },

    onHover: function() {
      _.defer(function() { Adapt.trigger('inspector:hover'); });
    },

    onTouch: function(event) {
      if (event.originalEvent.stopInspectorPropagation) return;

      event.originalEvent.stopInspectorPropagation = true;

      if (!$(event.target).is('[class*=inspector-]')) {
        Adapt.trigger('inspector:touch', this.$el);
      }
    }

  });

  function getLocationString(context) {
    const data = context.data.root;
    const id = data.length ? data[0]._id : data._id;
    const location = Adapt.location;
    const locationId = location._currentId;
    const locationType = location._contentType;

    return id !== locationId ? ' (' + locationType + ' ' + locationId + ')' : '';
  }

  Adapt.once('app:dataReady', function() {
    const config = Adapt.config.get('_inspector');

    if (!config || !config._isEnabled) return;

    const views = config._elementsToInspect || [ 'menu', 'menuItem', 'page', 'article', 'block', 'component' ];

    const eventList = views.map(function(view) { return view + 'View:postRender'; });

    Handlebars.registerHelper('inspector_location', getLocationString);

    Adapt.on('router:location', function() {
      new InspectorView();
    }).on(eventList.join(' '), function(view) {
      new InspectorContainerView({ el: view.$el, model: view.model });
    });
  });

});
