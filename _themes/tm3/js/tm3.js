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

// TM Namespace
var TM = {};

// Utilities
TM.util = {};
TM.util.addFormSubmissionHandler = function(form, action, callback) {
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

TM.util.emptyFn = function() {};

TM.util.getDocumentHeight = function() {
    return Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );
};

TM.util.getUrl = function(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.responseText);
        }
    };
    request.send();
};

TM.util.getSizeBasedOnWidth = function(width) {
    if (width <= 640)
        return 0;
    else if (width <= 1024)
        return 1;
    else if (width <= 1366)
        return 2

    return 3;
}

TM.util.getScreenSize = function() {
    return TM.util.getSizeBasedOnWidth(screen.width);
};

TM.util.getWindowSize = function() {
    return TM.util.getSizeBasedOnWidth(window.innerWidth);
};

TM.util.loadFastClick = function() {
    if (TM.util.getScreenSize() > 1) return;

    var script = document.createElement('script');
    script.addEventListener('load', function() {
        FastClick.attach(document.body);
    });
    script.src = '/_themes/tm3/js/fastclick.js';
    document.body.appendChild(script);
};

TM.util.mergeObjects = function(a, b, c) {
    for (c in b)
        b.hasOwnProperty(c) && ((typeof a[c])[0] == 'o' ? TM.util.mergeObjects(a[c], b[c]) : a[c] = b[c]);
};

TM.util.queryHTML = function(html, selector) {
    var root = document.createElement('DIV');
    root.innerHTML = html;

    return root.querySelector(selector);
};

TM.util.toggleLogoOpacity = function() {
    var targetY = 20,
        y = Math.abs(this.y) || window.pageYOffset,
        logo = document.getElementById('logo');

    if (y >= targetY && logo.hasClass('solid') === false) {
        logo.addClass('solid');
        return;
    }

    if (y < targetY && logo.hasClass('solid')) {
        logo.removeClass('solid');
        return;
    }
};

TM.util.updateScreenSizeClass = function() {
    var className,
        html = document.querySelector('html'),
        screenPrefix = 'screen-size-',
        space = ' ',
        regex = screenPrefix + '\\d';

    className = html.className;
    className = className.replace(new RegExp(regex), '').trim();
    className += space + screenPrefix + TM.util.getScreenSize();
    html.className = className;
};

// Page Object
TM.Page = function(customPage) {
    if (customPage === false || typeof customPage !== 'object')
        throw new Error('A Page object must be specified.');

	// Page object
    var _this = this, pageObject = {
        actionLinkEnabled: false,

		enableMap: false,

        el: {
            body: document.body,
            googleMap: document.getElementById('map'),
            googleMapCanvas: document.getElementById('map-canvas'),
            html: document.querySelector('html'),
            logo: document.getElementById('logo'),
            menuToggle: document.getElementById('menu-toggle')
        },

		logoHeight: 0,

        pageEvents: {},

        customEvents: {}
    };

	TM.util.mergeObjects(pageObject, customPage);

	// Methods
	this.methodExists = function(method) {
		return typeof pageObject.pageEvents[method] !== 'undefined';
	};

	this.callPageMethod = function(method, arguments) {
        pageObject.pageEvents[method].apply(pageObject, arguments);
    };

	this.callCustomMethod = function(method, arguments) {
        pageObject.customEvents[method].apply(pageObject, arguments);
    };

	// Register custom events
    for (element in pageObject.customEvents) {
        if (typeof pageObject.el[element] !== 'undefined') {
            for (eventName in pageObject.customEvents[element]) {
                var customEvent = pageObject.customEvents[element][eventName];

                if (eventName === 'submit')
                    TM.util.addFormSubmissionHandler(pageObject.el[element], customEvent.action, customEvent.callback);
                else {
                    pageObject.el[element].addEventListener(eventName, customEvent.bind(pageObject));
                }
            }
        }
    }

	// Register page events
	if (_this.methodExists('onBeforeUnload'))
        window.addEventListener('beforeunload', function internalOnBeforeUnload(event) {
            _this.callPageMethod('onBeforeUnload', [event]);
            window.removeEventListener('unload', internalOnBeforeUnload);
        });

	if (_this.methodExists('onLoad'))
		window.addEventListener('load', function internalOnLoad(event) {
        	_this.callPageMethod('onLoad', [event])
			window.removeEventListener('load', internalOnLoad);
		});

	if (_this.methodExists('onReady'))
        document.addEventListener('DOMContentLoaded', function internalOnReady(event) {
            _this.callPageMethod('onReady', [event]);
            document.removeEventListener('DOMContentLoaded', internalOnReady);
        });

	if (_this.methodExists('onScroll'))
        document.addEventListener('scroll', function internalOnScroll(event) {
            _this.callPageMethod('onScroll', [event]);
        });

	if (_this.methodExists('onTouchMove'))
        document.addEventListener('touchmove', function(event) {
            _this.callPageMethod('onTouchMove', [event]);
        });

	if (_this.methodExists('onUnload'))
        window.addEventListener('unload', function internalOnUnload(event) {
            _this.callPageMethod('onUnload', [event]);
            window.removeEventListener('unload', internalOnUnload);
        });

	if (_this.methodExists('onWindowResize'))
        window.addEventListener('resize', function internalOnWindowResize(event) {
            _this.callPageMethod('onWindowResize', [event]);
        });

	if (pageObject.enableMap)
        window.initMap = function(event) {
            _this.callPageMethod('onMapLoad', [event]);
        };

	if (_this.methodExists('onBodyFadeIn') || _this.methodExists('onBodyFadeOut'))
        pageObject.el.body.addEventListener('transitionend', function(event) {
            var target = event.target;

            if (target !== pageObject.el.body) return;

            if (target.hasClass('fadein'))
                _this.callPageMethod('onBodyFadeIn');
			else
                _this.callPageMethod('onBodyFadeOut');
        });
};


new TM.Page({
    el: {
        mailingListForm: document.getElementById('mailing-list-form')
    },

    pageEvents: {
		onBeforeUnload: function() {
            if (this.actionLinkEnabled) return;

            this.el.body.removeClass('fadein');
		},

		onLoad: function() {
            this.el.body.addClass('fadein');
            TM.util.toggleLogoOpacity();

            this.logoHeight = parseInt(this.el.logo.getStyle('height'));
		},

		onMapLoad: function() {
			this.callCustomMethod('onMapLoad');
		},

        onReady: function() {
            TM.util.updateScreenSizeClass();
            TM.util.loadFastClick();
        },

        onScroll: function(event) {
            TM.util.toggleLogoOpacity(event);
        },

        onTouchMove: function(event) {
            if (event.target.hasClass('scrollable'))
                event.preventDefault();
        },

        onWindowResize: function(event) {
            TM.util.updateScreenSizeClass();
        }
    },

    customEvents: {
        body: {
            click: function(event) {
                var target = event.target;

                if (target.nodeName !== 'A' && this.el.body.hasClass('checked'))
                    this.el.body.toggleClass('checked');

                if (target.nodeName === 'A')
                    this.actionLinkEnabled = target.getAttribute('data-actionlink');
            }
        },

        mailingListForm: {
            submit: {
                action: window.location.href,
                callback: function(form, request) {
                    form.innerHTML = TM.util.queryHTML(request.responseText, '#' + form.id).innerHTML;
                }
            }
        },

        menuToggle: {
            click: function(event) {
                event.preventDefault();
                this.el.body.toggleClass('checked');
            }
        }
    }
});