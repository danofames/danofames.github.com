var Slab = Slab || {};
Slab.Plugins = {
    // order here determines priority
    prototype:{
        test:function() {
            return typeof Prototype !== 'undefined';
        },
        utils:{
            query:{
                find:function(container, selector) {
                    return $(container).down(selector);
                },
                select:function(container, selector) {
                    return $(container).select(selector);
                }
            },
            events:{
                bind:function(el, ev, handler) {
                    Event.observe(el, ev, handler);
                },
                unbind:function(el, ev, handler) {
                    Event.stopObserving(el, ev, handler);
                },
                stop:function(ev) {
                    Event.stop(ev);
                }
            },
            dom:{
                createElement:function(container, element_name) {
                    return el = document.createElement(element_name);
                },
                addClass:function(el, class_name) {
                    $(el).addClassName(class_name);
                },
                removeClass:function(el, class_name) {
                    $(el).removeClassName(class_name);
                },
                toggleClass:function(el, class_name) {
                    $(el).toggleClassName(class_name);
                },
                getValue:function(el) {
                    return $(el).getValue();
                },
                getDataAttribute:function(el, attr) {
                    if (attr.indexOf('data-') < 0) {
                        attr = 'data-'+attr;
                    }
                    return $(el).getAttribute(attr);
                },
                getAttribute:function(el, attr) {
                    return $(el).getAttribute(attr);
                },
                setAttribute:function(el, attr, value) {
                    return $(el).setAttribute(attr, value);
                },
                setStyle:function(el, style) {
                    $(el).setStyle(style);
                },
                html:function(el) {
                    return $(el).innerHTML;
                }
            }
        }
    },
    jquery:{
        test:function() {
            return typeof jQuery !== 'undefined';
        },
        // may want to return [0] anytime an element is returned, so we do have
        // access to actual dom elements in the modules.
        utils:{
            query:{
                find:function(container, selector) {
                    return $(container).find(selector).first();
                },
                select:function(container, selector) {
                    return $(container).find(selector);
                }
            },
            events:{
                bind:function(el, ev, handler) {
                    $(el).on(ev, handler);
                },
                unbind:function(el, ev, handler) {
                    $(el).unbind(ev, handler);
                },
                stop:function(ev) {
                    ev.stopPropagation();
                }
            },
            dom:{
                createElement:function(container, element_name) {
                    return el = document.createElement(element_name);
                },
                addClass:function(el, class_name) {
                    $(el).addClass(class_name);
                },
                removeClass:function(el, class_name) {
                    $(el).removeClass(class_name);
                },
                toggleClass:function(el, class_name) {
                    $(el).toggleClass(class_name);
                },
                getValue:function(el) {
                    return $(el).val();
                },
                getDataAttribute:function(el, attr) {
                    attr = attr.replace(/data-/gi, '');
                    return $(el).data(attr);
                },
                getAttribute:function(el, attr) {
                    return $(el).prop(attr);
                },
                setAttribute:function(el, attr, value) {
                    return $(el).prop(attr, value);
                },
                setStyle:function(el, style) {
                    $(el).css(style);
                },
                html:function(el) {
                    return $(el).html();
                }
            }
        }
    },
    offloadedjavascript:{
        test:function() {
            return typeof OffloadedJavascript !== 'undefined'
        },
        utils:{
            dom:{
                loadScript:function(container, src, options) {
                    new OffloadedJavascript(src, '', options);
                }
            }
        }
    }
};