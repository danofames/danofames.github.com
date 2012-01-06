var OffloadedJavascripts = {
    pageLoaded: false,
    offloadedJavascripts: {},
    register: function(offloadedJavascript) {
        this.offloadedJavascripts[this.generateUniqueKey()] = offloadedJavascript;
        if (this.pageLoaded) {
            offloadedJavascript.loadScript();
        }
    },
    unregister: function(offloadedJavascript) {
       var offloadedJavascripts = [];
       for (var i in this.offloadedJavascripts) {
            if (this.offloadedJavascripts[i] != offloadedJavascript) {
                offloadedJavascripts[i] = this.offloadedJavascripts[i];
            }
       }
       this.offloadedJavascripts = offloadedJavascripts;
       offloadedJavascript = null;
    },
    generateUniqueKey: function() {
        var key = (arguments[0] || '') + '_';
        for (var i in this.offloadedJavascripts) {
            if (i == key) {
                return this.generateUniqueKey(key);
            }
        }
        return key;
    },
    keyFromOffloadedJavascript: function(offloadedJavascript) {
        for (var i in this.offloadedJavascripts) {
            if (this.offloadedJavascripts[i] == offloadedJavascript) {
                return i;
            }
        }
        return false;
    },
    callback: function(key) {
        return this.offloadedJavascripts[key].callback();
    },
    load: function() {
        var imgs = (navigator.userAgent.indexOf('AppleWebKit/') > -1) ? document.getElementsByTagName('img'):[];    
        if (!imgs.length || imgs[imgs.length-1].complete) {
            this.pageLoaded = true;
            this.loadScripts();
            return;
        }
        this.pageLoaded = true;
        window.setTimeout(this.bind(this.load, this), 100);
    },
    loadScripts: function() {
        for (var i in this.offloadedJavascripts) {
            this.offloadedJavascripts[i].loadScript();
        }
    },
    bind: function(method, bind) {
        return function() {
            method.apply(bind, arguments);
        };  
    },
    observe: function(elem, eventName, method) {
        if (elem.addEventListener) {
            elem.addEventListener(eventName, method, false);
        } else {
            elem.attachEvent("on" + eventName, method);
        }
    },
    stopObserving: function(elem, eventName, method) {
        if (elem.removeEventListener) {
            elem.removeEventListener(eventName, method, false);
        } else {
            elem.detachEvent("on" + eventName, method);
        }
    }
};
OffloadedJavascripts.observe(window, 'load', OffloadedJavascripts.bind(OffloadedJavascripts.load, OffloadedJavascripts));

var OffloadedJavascript = function() {
    this.init.apply(this, arguments);
};
OffloadedJavascript.prototype = {
    init: function(src, innerHTML) {
        this.src = src;
        this.innerHTML = innerHTML;
        this.options = this.extend({
            //callback is fired after script has finished loading and firing
            callback: function() {},
            //attributes are HTML attributes of the string, passed as an object
            attributes: {},
            parentNode: false
        }, arguments[2]);
        OffloadedJavascripts.register(this);
    },
    destroy: function() {
        OffloadedJavascripts.unregister(this);
    },
    loadScript: function() {
        this.options.parentNode = this.options.parentNode || document.body;
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        for (var i in this.options.attributes) {
            script.setAttribute(i, this.options.attributes[i]);
        }
        if (this.src) {
            script.setAttribute('src', this.src);
        } else {
            script = this.innerHTMLifyScript(script, this.innerHTML);
        }
        if (!this.src) {
            this.options.parentNode.appendChild(script);
            this.options.parentNode.appendChild(this.callbackScript());
        } else {
            if (!!(window.attachEvent && !window.opera)) {
                this.onReadyStateChangeHandler = OffloadedJavascripts.bind(this.onReadyStateChange, this);
                OffloadedJavascripts.observe(script, 'readystatechange', this.onReadyStateChangeHandler);
            } else {
                OffloadedJavascripts.observe(script, 'load', OffloadedJavascripts.bind(this.callback, this));
            }
            this.options.parentNode.appendChild(script);
        }
    },
    onReadyStateChange: function(event) {
        if (event.srcElement.readyState == 'complete' || event.srcElement.readyState == 'loaded' || event.srcElement.readyState == 'interactive') {
            OffloadedJavascripts.stopObserving(event.srcElement, 'readystatechange', this.onReadyStateChangeHandler);
            this.callback();
        }
    },
    callbackScript: function() {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javasscript');
        return this.innerHTMLifyScript(script, 'OffloadedJavascripts.callback("' + OffloadedJavascripts.keyFromOffloadedJavascript(this) + '");');
    },
    callback: function() {
        this.options.callback();
        this.destroy();
    },
    innerHTMLifyScript: function(script, innerHTML) {
        if (!!(window.attachEvent && !window.opera)) {
            script.text = innerHTML;
        } else {
            script.appendChild(document.createTextNode(innerHTML));
        } 
        return script;
    },
    extend: function(obj1, obj2) {
        for (var i in obj2) {
            obj1[i] = obj2[i];
        }
        return obj1;
    }
};
