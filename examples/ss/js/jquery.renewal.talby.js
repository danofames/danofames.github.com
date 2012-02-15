/**
 * jquery.renewal.js
 * Copyright (c) 2011 Mark Wunsch (markwunsch.com)
 * https://github.com/mwunsch/jquery-renewal
 * Licensed under the MIT License
 */
/*jshint eqnull: true */

(function ($) {
  var VERSION = '0.1.0',
      DEFAULTS = {
        accessor: 'carousel',
        EVENTS: {
          advance: 'renewal.advance',
          afterMove: 'renewal.moved',
          beforeMove: 'renewal.moving',
          move: 'renewal.move',
          reverse: 'renewal.reverse'
        },
        wrapperClassName: 'renewal-carousel-container'
      };

  function Renewal(element, configuration) {
    var defaults = {
          accessor: DEFAULTS.accessor,
          easing: null,
          eventAdvance: DEFAULTS.EVENTS.advance,
          eventAfterMove: DEFAULTS.EVENTS.afterMove,
          eventBeforeMove: DEFAULTS.EVENTS.beforeMove,
          eventMove: DEFAULTS.EVENTS.move,
          eventReverse: DEFAULTS.EVENTS.reverse,
          speed: 150,
          start: 0,
          vertical: false,
          visible: 1,
          infinite: false,
          wrapperClass: DEFAULTS.wrapperClassName
        },
        items, wrapper, conf, currentPosition, self = this;

    items = element.children();
    self.length = items.size();
    wrapper = element.parent();
    conf = $.extend({}, defaults, configuration || {});
    currentPosition = Math.abs(conf.start) || 0;

    // Don't allow infinite scrolling if there's only one slide
    // Also prevents infinite from working with more than one visible (not currently working)
    if (self.length < 2 || conf.visible > 1) conf.infinite = false;

    if (conf.infinite === true) {
      element.append($(items[0]).clone(false));
      element.prepend($(items[items.length-1]).clone(false));
      items = element.children();
    }

    function calculateElementWidth(el) {
      var marginLeft = parseInt(el.css('marginLeft'), 10),
          marginRight = parseInt(el.css('marginRight'), 10);
      return el.outerWidth() + marginLeft + marginRight;
    }

    function getItemWidth(upTo) {
      var width = 0;
      items.each(function (i, el) {
        if ((!upTo && upTo !== 0) || upTo >= i + 1) {
          width += calculateElementWidth($(el));
        }
      });
      return width;
    }

    element.css({
      'position': 'relative',
      'width': getItemWidth(),
      'left': -getItemWidth(Math.abs(conf.start))
    });

    wrapper.addClass(conf.wrapperClass);
    wrapper.css({
      'overflow-x': 'hidden'
    });
    if (conf.visible) {
      wrapper.css('width', getItemWidth(conf.visible));
    }

    function actuallyMoveTo(position,speed,easing) {
      if (conf.infinite) position += conf.visible;
      
      var style = {}, duration;
      duration = speed != null ? speed : conf.speed;
      style.left = '-' + getItemWidth(position) + 'px';
      if (duration) {
        element.animate(style, duration, easing || conf.easing);
      } else {
        element.css(style);
      }
    }

    self.moveTo = function moveTo(position, speed, easing) {
      var duration, maxPosition, minPosition, intendedPosition;

      minPosition = 0;
      maxPosition = self.length-conf.visible;

      if (conf.infinite) {
        if (position > maxPosition)      intendedPosition = minPosition;
        else if (position < minPosition) intendedPosition = maxPosition;
        else intendedPosition = position;
      } else {
        if (position > maxPosition) position = maxPosition;
        if (position < minPosition) position = minPosition;
        intendedPosition = position;
      }

      element.trigger(conf.eventBeforeMove,[self,currentPosition,intendedPosition]);
      actuallyMoveTo(position,speed,easing);
      element.trigger(conf.eventAfterMove,[self,currentPosition,intendedPosition]);
      element.trigger(conf.eventMove,[self,currentPosition,intendedPosition]);

      if (position != intendedPosition) actuallyMoveTo(intendedPosition, 1);

      currentPosition = intendedPosition;
      
      return self;
    };

    element.bind(conf.eventAdvance, function (e) {
      self.advance();
    });

    element.bind(conf.eventReverse, function (e) {
      self.reverse();
    });

    self.VERSION = VERSION;
    self.getPosition = function getPosition() {
      return currentPosition;
    };
    self.getCurrentItem = function getCurrentItem() {
      var position = currentPosition;
      if (conf.infinite) position += conf.visible;
      return items.eq(position);
    };
    self.getConfig = function getConfig() {
      return conf;
    };

    self.moveTo(conf.start,1);
  }

  Renewal.prototype.size = function size() {
    return this.length;
  };

  Renewal.prototype.advance = function advance(step) {
    var pos, config, nextPosition, maxPosition;

    pos = this.getPosition();
    config = this.getConfig();

    step = step ? step : config.visible || 1;
    nextPosition = pos + step;

    this.moveTo(nextPosition);
    return this;
  };

  Renewal.prototype.reverse = function reverse(step) {
    var pos, config, previousPosition;

    pos = this.getPosition();
    config = this.getConfig();

    step = step ? step : config.visible || 1;
    previousPosition = pos - step;

    this.moveTo(previousPosition);
    return this;
  };

  $.fn.renewal = function (config) {
    var carousel = new Renewal(this, config), acc;
    acc = (config || {}).accessor || DEFAULTS.accessor;
    return this.data(acc, carousel);
  };

})(jQuery);
