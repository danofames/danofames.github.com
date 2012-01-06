var Slab = Slab || {};
Slab.Sandbox = Slab.Sandbox || {};
Slab.Sandbox = function(app, module_id, label, options) {
    // has an idea of the container for the module
    // these functions call that of Slab.App, but checking that the elements
    // are the container or contained by the container
    var options = options || {},
        container;
    if (typeof options.container === 'string') {
        container = app.utils.query.find(document.documentElement, options.container);
    }
    else {
        container = options.container;
    }
    return {
        container:function() {
            return container;
        },
        getOption:function(k) {
            return (options && typeof options[k] !== 'undefined') ? options[k] : false;
        },
        log:function(s) {
            // console.log(s);
        },
        utils:{
            bind:function(fn, o) {
                return app.utils.bind(fn, o);
            },
            query:{
                find:function(selector) {
                    return app.utils.query.find(container, selector);
                },
                select:function(selector) {
                    return app.utils.query.select(container, selector);
                }
            },
            dom:{
                // could do stuff like make sure el is a child of container
                createElement:function(element_name) {
                    return app.utils.dom.createElement(container, el_name);
                },
                appendElement:function(element) {
                    return app.utils.dom.appendElement(container, el_name);
                },
                loadScript:function(src, options) {
                    app.utils.dom.loadScript(container, src, options);
                },
                addClass:function(el, class_name) {
                    app.utils.dom.addClass(el, class_name);
                },
                removeClass:function(el, class_name) {
                    app.utils.dom.removeClass(el, class_name);
                },
                toggleClass:function(el, class_name) {
                    app.utils.dom.toggleClass(el, class_name);
                },
                getValue:function(el) {
                    return app.utils.dom.getValue(el);
                },
                getDataAttribute:function(el, attr) {
                    return app.utils.dom.getDataAttribute(el, attr);
                },
                getAttribute:function(el, attr) {
                    return app.utils.dom.getAttribute(el, attr);
                },
                setAttribute:function(el, attr, value) {
                    app.utils.dom.setAttribute(el, attr, value);
                },
                setStyle:function(el, style) {
                    app.utils.dom.setStyle(el, style);
                },
                html:function(el) {
                    return app.utils.dom.html(el);
                }
            },
            events:{
                bind:function(el, ev, handler) {
                    app.utils.events.bind(el, ev, handler);
                },
                unbind:function(el, ev, handler) {
                    app.utils.events.unbind(el, ev, handler);
                },
                stop:function(ev) {
                    app.utils.events.stop(ev);
                }
            },
            ui:{
                slideshow:function(options) {
                    app.utils.ui.slideshow(container, options);
                }
            }
        },
        publish:function(ev) {
            app.triggerEvent(ev);
        },
        subscribe:function(evs) {
            app.registerEvents(module_id, evs);
        },
        destroy:function() {
            container = null;
            options = null;
            app = null;
        }
    }
};
