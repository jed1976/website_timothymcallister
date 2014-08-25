// Prototypes
// https://gist.github.com/Maksims/5356227
HTMLElement = typeof HTMLElement != 'undefined' ? HTMLElement : Element;

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


// TM Namespace and objects
TM = {};

// Map Object
TM.Map = function(mapCanvas) {
	if (TM.util.getScreenSize() < 1) return;

	var _this = this;

	this.featureOptions = [{
        featureType: 'water',
        stylers: [{ color: '#81d4fa' }]
    }];

	this.mapConfig = {
        disableDefaultUI: true,
        draggable: false,
        scrollwheel: false,
        zoom: 3
    };

	this.callback = 'mapCallback';
	this.customMapType = null;
	this.defaultLatitude = 23.0414243;
	this.defaultLongitude = -83.8188083;
    this.infoWindow = null;
	this.mapCanvas = mapCanvas;
	this.mapObj = null;
    this.mapTypeID = 'custom_style';
	this.markerIcon = null;
	this.markerIconPath = '/_themes/tm3/img/marker.png';
	this.markerIconHeight = 45;
	this.markerIconWidth = 25;
    this.markers = {};
    this.maxInfoWindowWidth = 320;

	TM[this.callback] = function(event) {
	    _this.initialize();
	};

    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA2Kd093BDPlBJhWykIlVOEHamfG4_8WKo&callback=TM.' + this.callback;
    document.body.appendChild(script);
};

TM.Map.prototype.initialize = function() {
    this.markerIcon = new google.maps.MarkerImage(this.markerIconPath, null, null, null, new google.maps.Size(this.markerIconWidth, this.markerIconHeight));
    this.infoWindow = new google.maps.InfoWindow();

	TM.util.mergeObjects(this.mapConfig, {
        center: new google.maps.LatLng(this.defaultLatitude, this.defaultLongitude),
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, this.mapTypeID]
        },
        mapTypeId: this.mapTypeID
    });

    this.googleMap = new google.maps.Map(this.mapCanvas, this.mapConfig);
    this.customMapType = new google.maps.StyledMapType(this.featureOptions, { name: '' });
    this.googleMap.mapTypes.set(this.mapTypeID, this.customMapType);
};

TM.Map.prototype.addMarker = function(title, latitude, longitude) {
	if (typeof this.markers[title] !== 'undefined') return;

	var marker = marker = new google.maps.Marker({
	        animation: google.maps.Animation.DROP,
	        icon: this.markerIcon,
	        position: new google.maps.LatLng(latitude, longitude),
	        map: this.googleMap,
	        title: title
	    });

    this.markers[title] = marker;
};

TM.Map.prototype.setAllMap = function(map) {
	for (prop in this.markers)
		this.markers[prop].setMap(map);
};

TM.Map.prototype.clearMarkers = function() {
	this.setAllMap(null);
};

TM.Map.prototype.deleteMarkers = function() {
	this.clearMarkers();
	this.markers = {};
};

TM.Map.prototype.showMarkers = function() {
	this.setAllMap(this.googleMap);
};


// Module Object
TM.Module = function(customModule) {
    if (customModule === false || typeof customModule !== 'object')
        throw new Error('A Module object must be specified.');

	// Variables
    var _this = this, module = {
        actionLinkEnabled: false,

        el: {
            body: document.body,
			content: document.getElementById('content'),
            html: document.querySelector('html'),
            logo: document.getElementById('logo'),
            menuToggle: document.getElementById('menu-toggle')
        },

        callbacks: {},

        events: {}
    };

	TM.util.mergeObjects(module, customModule);

	// Methods
	this.methodExists = function(method) {
		return typeof module.callbacks[method] !== 'undefined';
	};

	this.callModuleMethod = function(method, arguments) {
        module.callbacks[method].apply(module, arguments);
    };

	this.callCustomMethod = function(method, arguments) {
        module.events[method].apply(module, arguments);
    };

	// Register custom events
    for (element in module.events) {
        if (typeof module.el[element] !== 'undefined') {
            for (eventName in module.events[element]) {
                var event = module.events[element][eventName];

                if (eventName === 'submit')
                    TM.util.addFormSubmissionHandler(module.el[element], event.action, event.callback);
                else {
                    module.el[element].addEventListener(eventName, event.bind(module));
                }
            }
        }
    }

	// Register page events
	if (_this.methodExists('onBeforeUnload'))
        window.addEventListener('beforeunload', function internalOnBeforeUnload(event) {
            _this.callModuleMethod('onBeforeUnload', [event]);
            window.removeEventListener('unload', internalOnBeforeUnload);
        });

	if (_this.methodExists('onLoad'))
		window.addEventListener('load', function internalOnLoad(event) {
        	_this.callModuleMethod('onLoad', [event])
			window.removeEventListener('load', internalOnLoad);
		});

	if (_this.methodExists('onPopState'))
	    window.addEventListener('popstate', function(event) {
	        _this.callModuleMethod('onPopState', [event]);
	    });

	if (_this.methodExists('onReady'))
        document.addEventListener('DOMContentLoaded', function internalOnReady(event) {
            _this.callModuleMethod('onReady', [event]);
            document.removeEventListener('DOMContentLoaded', internalOnReady);
        });

	if (_this.methodExists('onScroll'))
        document.addEventListener('scroll', function internalOnScroll(event) {
            _this.callModuleMethod('onScroll', [event]);
        });

	if (_this.methodExists('onTouchMove'))
        document.addEventListener('touchmove', function(event) {
            _this.callModuleMethod('onTouchMove', [event]);
        });

	if (_this.methodExists('onUnload'))
        window.addEventListener('unload', function internalOnUnload(event) {
            _this.callModuleMethod('onUnload', [event]);
            window.removeEventListener('unload', internalOnUnload);
        });

	if (_this.methodExists('onWindowResize'))
        window.addEventListener('resize', function internalOnWindowResize(event) {
            _this.callModuleMethod('onWindowResize', [event]);
        });

	if (_this.methodExists('onBodyFadeIn') || _this.methodExists('onBodyFadeOut'))
        module.el.body.addEventListener('transitionend', function(event) {
            var target = event.target;

            if (target !== module.el.body) return;

            if (target.hasClass('fadein'))
                _this.callModuleMethod('onBodyFadeIn');
			else
                _this.callModuleMethod('onBodyFadeOut');
        });
};


// Utilities
TM.util = {};

TM.util.screens = {
	small: 640,
	medium: 1024,
	large: 1366
}

TM.util.emptyFn = function() {};

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
    if (width <= TM.util.screens.small)
        return 0;
    else if (width <= TM.util.screens.medium)
        return 1;
    else if (width <= TM.util.screens.large)
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