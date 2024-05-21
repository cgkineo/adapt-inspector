import Adapt from 'core/js/adapt';

class InspectorContainerView extends Backbone.View {
  initialize() {
    const id = this.model.get('_id');

    this.listenTo(Adapt, 'remove', this.remove).addTracUrl(id);
    this.$el.data(this.model);
    Adapt.trigger('inspector:id', id);
  }

  events() {
    return {
      mouseenter: 'onHover',
      mouseleave: 'onHover',
      touchend: 'onTouch'
    };
  }

  addTracUrl(id) {
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
  }

  onHover() {
    _.defer(function() { Adapt.trigger('inspector:hover'); });
  }

  onTouch(event) {
    if (event.originalEvent.stopInspectorPropagation) return;

    event.originalEvent.stopInspectorPropagation = true;

    if (!$(event.target).is('[class*=inspector-]')) {
      Adapt.trigger('inspector:touch', this.$el);
    }
  }
}

export default InspectorContainerView;
