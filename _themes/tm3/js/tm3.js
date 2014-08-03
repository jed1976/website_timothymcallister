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
window.createQuoteCarousel = function() {
    var currentQuoteIndex = 0,
        quotes = document.querySelectorAll('.quote'),
        quoteInterval = 8000,
        quoteTimerID;

    if (quotes.length === 0) return;

    quotes[currentQuoteIndex].toggleClass('fadein');

    quoteTimerID = setTimeout(function() {
        quotes[currentQuoteIndex].toggleClass('fadein');

        currentQuoteIndex++;

        if (currentQuoteIndex === quotes.length)
            currentQuoteIndex = 0;

        quotes[currentQuoteIndex].toggleClass('fadein');

        setTimeout(arguments.callee, quoteInterval);
    }, quoteInterval);

    window.addEventListener('unload', function unload() {
        window.removeEventListener('unload', unload, false);
        window.clearTimeout(quoteTimerID);
    });
};

window.getSizeBasedOnWidth = function(width) {
    if (width < 640)
        return 0;
    else if (width < 1024)
        return 1;
    else if (width < 1367)
        return 2

    return 3;
}

window.getScreenSize = function() {
    return window.getSizeBasedOnWidth(screen.width);
};

window.getWindowSize = function() {
    return window.getSizeBasedOnWidth(window.width);
};

window.loadFastClick = function() {
    if (getScreenSize() > 1) return;

    var script = document.createElement('script');
    script.addEventListener('load', function() {
        FastClick.attach(document.body);
    });
    script.src = 'assets/js/fastclick.js';
    document.body.appendChild(script);
};

window.toggleLogoOpacity = function() {
    var y = Math.abs(this.y) || window.pageYOffset,
        targetY = 600,
        opacity = (100 - ((targetY - y) / targetY) * 100) / 100,
        changeOpacity = function(opacity) {
            document.getElementById('logo').style.backgroundColor = 'rgba(0, 0, 0, ' + opacity + ')';
        };

    if (y > targetY) {
        changeOpacity(0.9);
        return;
    }

    if (opacity > 0.9) return;

    changeOpacity(opacity);
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
    updateScreenSizeClass();
    loadFastClick();

    document.addEventListener('scroll', toggleLogoOpacity);

    document.body.addEventListener('click', function(event) {
        var target = event.target;

        if (target.nodeName != 'A' && target.nodeName != 'SPAN') return;

        if (target.nodeName === 'SPAN')
            target = target.parentNode;

        if (target.getAttribute('href') === null) return;

        if (target.hasClass('u-url') ||
            target.hasClass('email') ||
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
    document.querySelector('#menu-toggle').addEventListener('click', function(event) {
        event.target.toggleClass('checked');
    });
});

window.addEventListener('load', function load() {
    window.removeEventListener('load', load, false);
    document.body.addClass('fadein');
});