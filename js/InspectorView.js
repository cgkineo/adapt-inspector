import Adapt from 'core/js/adapt';
import device from 'core/js/device';
import React from 'react';
import ReactDOM from 'react-dom';
import { templates } from 'core/js/reactHelpers';

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
    });

    this.render();
    this.ids = [];
  }

  render() {
    const data = {
      ...this,
      model: this.model.toJSON(),
      _tracUrl: this.model.get('_trac')?._url
    };
    ReactDOM.render(<templates.inspector {...data} />, this.el);
  }

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
    // this.$el.hide(); // ! TESTING - Do not keep commented out
  }

  updateInspector($hovered) {
    const $previous = $('.inspector-visible');
    if ($hovered.is($previous.last())) return;

    const data = [];

    $previous.removeClass('inspector-visible');

    this.addOverlappedElements($hovered).each(function() {
      const $element = $(this);
      const attributes = $element.data().attributes;
      if (!attributes) return;

      data.push(attributes);
      $element.addClass('inspector-visible');
    });

    // ReactDOM.render(<templates.inspector {...data} />, this.el);
    this.$el.removeAttr('style').removeClass('inline');

    this.updateOffset($hovered);
  }

  updateOffset($hovered) {
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

  static get template() {
    return 'inspector.jsx';
  }
};

export default InspectorView;
