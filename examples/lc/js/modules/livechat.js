var Slab = Slab || {};
Slab.Modules = Slab.Modules || {};
Slab.Modules.livechat_link = function(s) {
    var link,
        status;
    return {
        initLink:function(data) {
            var href = s.utils.dom.getAttribute(link, 'href');
            if (href) {
                href += '&referrer='+encodeURIComponent(document.location);
                s.utils.dom.setAttribute(link, 'href', href);
                s.utils.events.bind(link, 'click', function(e) {
                    s.utils.events.stop(e);
                    window.open(this.href, this.getAttribute('target'), 'width=475,height=400,resizable=yes');
                    return false;
                });
                if (data.online) {
                    s.utils.dom.setStyle(s.container(), {display:'block'});
                }
            }
        },
        create:function() {
            if (s.utils.dom.getAttribute(s.container(), 'href')) {
                link = s.container();
            }
            else {
                link = s.utils.query.find('a');
            }
            if (link) {
                s.subscribe({
                    'livechat-status':s.utils.bind(this.initLink, this)
                });
            }
        },
        destroy:function() {
            s.log('livechat link destroy')
            link = null;
            s.destroy();
        }
    };
};
Slab.Modules.livechat_status_report = function(s) {
    return {
        showStatus:function(data) {
            var el = s.container(),
                status = '';
            if (!data.online) {
                s.utils.dom.setStyle(s.container(), {display:'block'});
            }
        },
        create:function() {
            s.subscribe({
                'livechat-status':s.utils.bind(this.showStatus, this)
            });
        },
        destroy:function() {}
    };
};
Slab.Modules.livechat_status = function(s) {
    var config = s.getOption('config');
    var button,
        lpStatusDivId,
        lpSkillVar,
        lpButtonRemoteScriptSrc,
        lpMTagConfig;
    return {
        isOperatorOnline:function() {
            var online = false;
            if (s.container()) {
                var text = s.utils.dom.html(s.container());
                online = /OPERATORONLINE/.test(text);
            }
            return online;
        },
        statusEnabled:function() {
            if (config) {
                s.publish({
                    type: 'livechat-status',
                    data:{
                        account:config.account,
                        team:config.team,
                        online:this.isOperatorOnline()
                    }
                });
            }
        },
        create:function() {
            if (config && config.account) {
                var container_id = s.utils.dom.getAttribute(s.container(), 'id');
                var src = s.utils.dom.getDataAttribute(s.container(), 'status-src');
                if (src) {
                    s.utils.dom.loadScript(src, {
                        callback:s.utils.bind(this.statusEnabled, this)
                    });
                }
            }

        },
        destroy:function() {
            s.log('livechat status destroy')
            s.destroy();
        }
    };
};