// Prototypes
// https://gist.github.com/Maksims/5356227
HTMLElement = typeof(HTMLElement) != 'undefiend' ? HTMLElement : Element;

HTMLElement.prototype.addClass = function(string) {
    if (!(string instanceof Array)) {
        string = string.split(' ');
    }

    for (var i = 0, len = string.length; i < len; ++i) {
        if (string[i] && !new RegExp('(\\s+|^)' + string[i] + '(\\s+|$)').test(this.className)) {
            this.className = this.className.trim() + ' ' + string[i];
        }
    }
};

HTMLElement.prototype.findParentNodeWithName = function(name) {
    if (this.nodeName === name) return this;
    return this.parentNode.findParentNodeWithName(name);
};

HTMLElement.prototype.getPosition = function() {
    var curleft = 0,
        curtop = 0,
        obj = this;

    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }

    return [curleft, curtop];
};

HTMLElement.prototype.getStyle = function(style) {
    return window.getComputedStyle(this).getPropertyValue(style);
};

HTMLElement.prototype.hasClass = function(string) {
    return string && new RegExp('(\\s+|^)' + string + '(\\s+|$)').test(this.className);
};

HTMLElement.prototype.index = function() {
    var nodeList = [].slice.call(this.parentNode.children);
    return nodeList.indexOf(this);
};

HTMLElement.prototype.insertStringBefore = function(string) {
    this.outerHTML = string + this.outerHTML;
};

HTMLElement.prototype.insertStringTop = function(string) {
    this.innerHTML = string + this.innerHTML;
};

HTMLElement.prototype.insertStringBottom = function(string) {
    this.innerHTML = this.innerHTML + string;
};

HTMLElement.prototype.insertStringAfter = function(string) {
    this.outerHTML += string;
};

HTMLElement.prototype.removeClass = function(string) {
    if (!(string instanceof Array)) {
        string = string.split(' ');
    }
    for (var i = 0, len = string.length; i < len; ++i) {
        this.className = this.className.replace(new RegExp('(\\s+|^)' + string[i] + '(\\s+|$)'), ' ').trim();
    }
};

HTMLElement.prototype.toggleClass = function(string) {
    if (string) {
        if (new RegExp('(\\s+|^)' + string + '(\\s+|$)').test(this.className)) {
            this.className = this.className.replace(new RegExp('(\\s+|^)' + string + '(\\s+|$)'), ' ').trim();
        } else {
            this.className = this.className.trim() + ' ' + string;
        }
    }
};

// Functions
window.getDocumentHeight = function() {
    return Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );
};

window.getUrl = function(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.responseText);
        }
    };
    request.send();
};

window.getSizeBasedOnWidth = function(width) {
    if (width < 639)
        return 0;
    else if (width < 1023)
        return 1;
    else if (width < 1365)
        return 2

    return 3;
}

window.getScreenSize = function() {
    return window.getSizeBasedOnWidth(screen.width);
};

window.getWindowSize = function() {
    return window.getSizeBasedOnWidth(window.innerWidth);
};

window.loadFastClick = function() {
    if (getScreenSize() > 1) return;

    var script = document.createElement('script');
    script.addEventListener('load', function() {
        FastClick.attach(document.body);
    });
    script.src = '/_themes/tm3/js/fastclick.js';
    document.body.appendChild(script);
};

window.queryHTML = function(html, selector) {
    var root = document.createElement('DIV');
    root.innerHTML = html;

    return root.querySelector(selector);
};

window.submitForm = function(form, action, callback) {
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        var params = [];

        [].forEach.call(event.target.elements, function(el) {
            if (el.name)
                params.push(el.name + '=' + encodeURI(el.value));
        });

        params = params.join('&');

        var request = new XMLHttpRequest();
        request.open('POST', action, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                callback(form, request);
            }
        };
        request.send(params);
    });
};

window.updateScreenSizeClass = function() {
    var className,
        html = document.querySelector('html'),
        screenPrefix = 'screen-size-',
        space = ' ',
        regex = screenPrefix + '\\d';

    className = html.className;
    className = className.replace(new RegExp(regex), '').trim();
    className += space + screenPrefix + getScreenSize();
    html.className = className;
};

document.addEventListener('DOMContentLoaded', function() {
    var body = document.body;

    updateScreenSizeClass();
    loadFastClick();

    submitForm(document.getElementById('mailing-list-form'), window.location.href, function(form, request) {
        form.innerHTML = queryHTML(request.responseText, '#' + form.id).innerHTML;
    });

    document.body.addEventListener('click', function(event) {
        var target = event.target;

        if (target.nodeName != 'A' && target.nodeName != 'SPAN') return;

        if (target.nodeName === 'SPAN')
            target = target.parentNode;

        if (target.getAttribute('href') === null) return;

        if (target.hasClass('u-url') ||
            target.hasClass('email') ||
            target.hasClass('sample') ||
            target.hasClass('download')) return;

        linkLocation = target.getAttribute('href');

        event.preventDefault();

        if (linkLocation.indexOf('#') > -1) return;

        document.body.removeClass('fadein');
        window.location = linkLocation;
    });

    // Update screen size classes on resize
    window.addEventListener('resize', function() {
        updateScreenSizeClass();
    });

    // Menu toggle listener
    document.getElementById('menu-toggle').addEventListener('click', function() {
        body.toggleClass('checked');
    });

    if (window.getScreenSize() < 2) {
        body.addEventListener('touchmove', function(event) {
            if (event.target.hasClass('scrollable'))
                event.preventDefault();
        });
    };
});

window.addEventListener('load', function load() {
    window.removeEventListener('load', load, false);
    document.body.addClass('fadein');
});