import Adapt from 'core/js/adapt';
import device from 'core/js/device';

class InspectorView extends Backbone.View {
  className() {
    return 'inspector';
  }

  events() {
    return {
      mouseleave: 'onLeave'
    };
  }

  initialize() {
    const config = Adapt.config.get('_inspector');
    if (device.touch && config._isDisabledOnTouch) return;

    _.bindAll(this, 'onLeave', 'pushId', 'setVisibility', 'updateInspector', 'onResize', 'remove');

    this.listenTo(Adapt, {
      'inspector:id': this.pushId,
      'inspector:hover': this.setVisibility,
      'inspector:touch': this.updateInspector,
      'device:resize': this.onResize,
      remove: this.remove
    }).render();

    this.ids = [];
  }

  render() {
    $('#wrapper').append(this.$el);
  };

  pushId(id) {
    this.ids.push(id);
  }

  setVisibility() {
    if (this.$el.is(':hover')) return;

    for (let i = this.ids.length - 1; i >= 0; --i) {
      const $hovered = $("[data-adapt-id='" + this.ids[i] + "']:hover");

      if ($hovered.length) return this.updateInspector($hovered);
    }

    $('.inspector-visible').removeClass('inspector-visible');
    this.$el.hide();
  }

  updateInspector($hovered) {
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
  }

  addOverlappedElements($hovered) {
    const checkOverlap = function() {
      const $element = $(this);

      const isOverlapped = $element.height() && _.isEqual($element.offset(), $hovered.offset()) && $element.width() === $hovered.width();

      if (isOverlapped) $hovered = $hovered.add($element);
    };

    for (let i = this.ids.length - 1; i >= 0; --i) {
      $("[data-adapt-id='" + this.ids[i] + "']").each(checkOverlap);
    }

    return $hovered;
  }

  onResize() {
    const $hovered = $('.inspector-visible');

    if (!$hovered.length) return;

    $hovered.removeClass('inspector-visible');
    this.updateInspector($hovered.last());
  }

  onLeave() {
    _.defer(this.setVisibility.bind(this));
  }
};

export default InspectorView;
