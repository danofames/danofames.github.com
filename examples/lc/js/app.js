var Slab = Slab || {};
Slab.App = (function() {
    var modules = {},
        module_count = 0,
        module_groups = [];
    var getModule = function(module_id) {
        return modules[module_id] || {};
    };
    // functions that will be implemented through framework specific calls
    var _utils = {
        bind:function(fn, o) {
            return function() {
                fn.apply(o, arguments);
            }
        }
    };
    var getObject = function(base, id) {
        var o = base;
        var id_parts = id.split('.');
        if (!o || !id || id_parts.length <= 0) {
            return undefined;
        }
        for(var i=0; i < id_parts.length;i++) {
            if (o[id_parts[i]]) {
                o = o[id_parts[i]];
            }
            else {
                o = undefined;
                break;
            }
        }
        return o;
    };
    var makeObject = function(id, o) {
        var id_parts = id.split('.');
        if (id && id_parts.length > 0) {
            var t = {};
            t[id_parts[id_parts.length-1]] = o;
            o = makeObject(id_parts.slice(0, id_parts.length-1).join('.'), t);
        }
        return o;
    };
    // copied from http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
    var extendObject = function(d, s) {
        for (var property in s) {
            if (s[property] && s[property].constructor &&
              s[property].constructor === Object) {
              d[property] = d[property] || {};
              arguments.callee(d[property], s[property]);
            }
            else {
              d[property] = s[property];
            }
        }
        return d;
    };
    var getUtilFunction = function(function_id) {
        // function_id is a path to a function in utils. 'query.select'
        var util_function = getObject(_utils, function_id);
        if (!util_function) {
            var f,
                framework;
            for (f in Slab.Plugins) {
                framework = Slab.Plugins[f];
                if (framework.test() && framework.utils) {
                    var framework_function = getObject(framework, 'utils.'+function_id);
                    if (framework_function) {
                        util_function = framework_function;
                        // _utils.query.select = framework_function;
                        _utils = extendObject(_utils,
                            makeObject(function_id, util_function));
                        break;
                    }
                }
            }
        }
        if (!util_function) {
            throw "Didn't find an implementation of " + function_id; //function() {};
        }
        return util_function;
    };
    var _registerModule = function (label, constructor, options) {
        module_count += 1;
        var module_id = 'slab-module-' + module_count;
        modules[module_id] = {
            label:label,
            creator:constructor,
            options:options || null,
            instance:null
        };
        return module_id;
    }
    return {
        register:function(label, constructor, options) {
            return _registerModule(label, constructor, options);
        },
        registerModules:function(label, constructor, options, selector) {
            module_groups.push({
                label:label,
                constructor:constructor,
                options:options,
                selector:selector
            });
        },
        // called at </body> or domready
        init:function() {
            this.startAll();
            // destroy modules on window unload
            getUtilFunction('events.bind')(window, 'unload', getUtilFunction('bind')(
                this.destroy, this));
        },
        destroy:function() {
            this.stopAll();
            modules = null;
        },
        start:function(module_id) {
            var m = getModule(module_id);
            if (m.creator && !m.instance) {
                var s = Slab.Sandbox(this, module_id, m.label, m.options);
                if (typeof m.creator === 'string') {
                    // if a string, m.creator will be 'Slab.Modules.<something>'
                    // so we should be able to search for it on window
                    m.creator = getObject(window, m.creator);
                }
                if (m.creator) {
                    m.instance = m.creator(s);
                    m.instance.create();
                }
            }
            return m;
        },
        stop:function(module_id) {
            var m = getModule(module_id);
            if (m && m.instance) {
                m.instance.destroy();
                m.instance = null;
            }
        },
        startAll:function() {
            var m,
                mlength=module_groups.length;
            for (var i=mlength-1;i>=0;i--) {
                m = module_groups[i];
                var els = getUtilFunction('query.select')(
                    document.documentElement, m.selector);
                for (var j=0, elslength=els.length;j<elslength;j++) {
                    m.options.container = els[j];
                    _registerModule(m.label, m.constructor, m.options);
                }
                module_groups.splice(i, 1);
            }
            var module_id;
            for (module_id in modules) {
                if (modules.hasOwnProperty(module_id)) {
                    this.start(module_id);
                }
            }
        },
        stopAll:function() {
            var module_id;
            for (module_id in modules) {
                if (modules.hasOwnProperty(module_id)) {
                    this.stop(module_id);
                }
            }
        },
        registerEvents:function(module_id, evs) {
            if (modules[module_id]) {
                var m = modules[module_id];
                if (!m.events) {
                    m.events = {};
                }
                for (var ev in evs) {
                    m.events[ev] = evs[ev];
                    if (m.previous_events && m.previous_events[ev]) {
                        m.events[ev](m.previous_events[ev]);
                        delete m.previous_events[ev];
                    }
                }
            }
        },
        triggerEvent:function(ev) {
            for (var module_id in modules) {
                if (modules.hasOwnProperty(module_id)){
                    m = modules[module_id];
                    if (m.events && m.events[ev.type]) {
                        m.events[ev.type](ev.data);
                    }
                    else {
                        // basic (read: likely buggy) attempt at caching triggered
                        // events that some yet to be registered module might want
                        // to act on. it's weird to store events the module may
                        // never care about
                        if (!m.previous_events) {
                            m.previous_events = {};
                        }
                        m.previous_events[ev.type] = ev.data;
                    }
                }
            }

        },
        // "public" interface to utils
        utils:{
            // general
            bind:function(fn, o) {
                return getUtilFunction('bind')(fn, o);
            },
            // manipulating dom
            dom:{
                addClass:function(element, class_name) {
                    getUtilFunction('dom.addClass')(element, class_name);
                },
                removeClass:function(element, class_name) {
                    getUtilFunction('dom.removeClass')(element, class_name);
                },
                toggleClass:function(element, class_name) {
                    getUtilFunction('dom.toggleClass')(element, class_name);
                },
                createElement:function(container, element_name) {
                    return getUtilFunction('dom.createElement')(
                        container, element_name);
                },
                appendElement:function(container, element) {
                    return getUtilFunction('dom.appendElement')(
                        container, element);
                },
                loadScript:function(container, src, options) {
                    getUtilFunction('dom.loadScript')(container, src, options);
                },
                getValue:function(element, attr) {
                    return getUtilFunction('dom.getValue')(element);
                },
                getDataAttribute:function(element, attr) {
                    return getUtilFunction('dom.getDataAttribute')(element, attr);
                },
                getAttribute:function(element, attr) {
                    return getUtilFunction('dom.getAttribute')(element, attr);
                },
                setAttribute:function(element, attr, value) {
                    getUtilFunction('dom.setAttribute')(element, attr, value);
                },
                setStyle:function(el, style) {
                    getUtilFunction('dom.setStyle')(el, style);
                },
                html:function(element) {
                    return getUtilFunction('dom.html')(element);
                }
            },
            // finding elements
            query:{
                // return one element that matches
                find:function(container, selector) {
                    return getUtilFunction('query.find')(container, selector);
                },
                // return all elements that match
                select:function(container, selector) {
                    return getUtilFunction('query.select')(container, selector);
                }
            },
            // attaching event handlers to elements
            events:{
                bind:function(el, ev, handler) {
                    return getUtilFunction('events.bind')(el, ev, handler);
                },
                unbind:function(el, ev, handler) {
                    return getUtilFunction('events.unbind')(el, ev, handler);
                },
                stop:function(ev) {
                    return getUtilFunction('events.stop')(ev);
                }
            },
            ui:{
                slideshow:function(el, options) {
                    getUtilFunction('ui.slideshow')(el, options);
                }
            }
        }
    };
})();