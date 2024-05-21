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

    const reversedIds = this.ids.toReversed();
    for (const id of reversedIds) {
      const $hovered = $(`[data-adapt-id="${id}"]:hover`);

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
    this.ids.forEach((id) => {
      const $element = $(`[data-adapt-id="${id}"]`);
      this.checkOverlap($element, $hovered);
    });

    return $hovered;
  }

  checkOverlap($element, $hovered) {
    const areOffsetsEqual = _.isEqual($element.offset(), $hovered.offset());
    const areWidthsEqual = $element.width() === $hovered.width();
    const isOverlapped = $element.height() && areOffsetsEqual && areWidthsEqual;

    if (isOverlapped) $hovered = $hovered.add($element);
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
