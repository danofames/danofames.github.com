// these bits are just trying to mimic the livechat behavior
(function(w, d) {
    var container = d.getElementById('livechat-status');
    var status;
    if (Math.round(Math.random() * 10) % 2 == 0) {
        status = 'OPERATORONLINE'
    }
    else {
        status = '';
    }
    container.appendChild(d.createTextNode(status));
})(window, document);