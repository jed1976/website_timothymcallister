new TM.Page({
    el: {
        performanceList: document.getElementById('performance-list')
    },

    activeClass: 'active',

    enableMap: true,

    currentPerformance: null,

    currentRow: null,

    customMapType: null,

    featureOpts: [{
        featureType: 'water',
        stylers: [
            { color: '#81d4fa' }
        ]
    }],

    googleMap: null,

    googleMapInfoWindow: null,

    initialZoomLevel: 3,

    mapTypeID: 'custom_style',

    markers: {},

    maxGoogleMapInfoWindowWidth: 320,

    maxSummaryLength: 250,

    performanceTitleSelector: '.p-location .p-name',

    performanceSummarySelector: '.p-summary',

    pageEvents: {
        onLoad: function() {
            if (TM.util.getScreenSize() < 1) return;
            this.el.html.addClass('map');

            var script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA2Kd093BDPlBJhWykIlVOEHamfG4_8WKo&callback=initMap';
            document.body.appendChild(script);

            this.resizeMap();
        },

        onMapLoad: function() {
            this.icon = new google.maps.MarkerImage('/_themes/tm3/img/marker.png', null, null, null, new google.maps.Size(25, 45));

            this.googleMapInfoWindow = new google.maps.InfoWindow();

            this.createMap(this.el.googleMapCanvas, {
                center: new google.maps.LatLng(23.0414243, -83.8188083),
                disableDefaultUI: true,
                draggable: false,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.ROADMAP, this.mapTypeID]
                },
                mapTypeId: this.mapTypeID,
                scrollwheel: false,
                zoom: this.initialZoomLevel
            }, {
                name: 'Custom Style'
            });

            this.createMarkers();
            this.selectFirstEvent();
        },

        onWindowResize: function() {
            this.resizeMap();
            this.centerAndPanMap();
        }
    },

    customEvents: {
        performanceList: {
            click: function(event) {
                event.preventDefault();

                var target = event.target.findParentNodeWithName('ARTICLE'),
                    performance = target,
                    titleEl = performance.querySelector(this.performanceTitleSelector),
                    title = titleEl ? titleEl.innerHTML : '',
                    summary = performance.querySelector(this.performanceSummarySelector),
                    maxGoogleMapInfoWindowWidth = (summary && summary.innerHTML.length > this.maxSummaryLength) ? Math.round(window.innerWidth / 2) : this.maxGoogleMapInfoWindowWidth;

                this.currentPerformance = this.markers[title];

                if (this.currentRow)
                    this.currentRow.toggleClass(this.activeClass);

                this.currentRow = performance;
                this.currentRow.toggleClass(this.activeClass);

                this.displayInfoWindow(performance.outerHTML);
            }
        }
    },

    centerAndPanMap: function() {
        this.googleMapInfoWindow.close();
        this.googleMapInfoWindow.open(this.googleMap, this.currentPerformance.marker);
        this.el.googleMapInfoWindow = document.querySelector('.gm-style-iw');
        this.googleMap.setCenter(this.currentPerformance.coordinates);
        this.googleMap.panBy(-(this.el.performanceList.offsetWidth / 2), -((this.el.googleMapInfoWindow.offsetHeight / 2) + this.logoHeight));
    },

    createMap: function(mapCanvas, mapOptions, styledMapOptions) {
        this.googleMap = new google.maps.Map(mapCanvas, mapOptions);
        this.customMapType = new google.maps.StyledMapType(this.featureOpts, styledMapOptions);
        this.googleMap.mapTypes.set(this.mapTypeID, this.customMapType);
        this.el.googleMap.addClass('fadein');
    },

    createMarkers: function() {
        var eventEl, coordinates, marker, title, _this = this;

        [].forEach.call(this.el.performanceList.querySelectorAll('.h-event'), function(el) {
            title = el.querySelector('.p-location .p-name');
            title = title ? title.innerHTML : '';
            coordinates = new google.maps.LatLng(el.getAttribute('data-latitude'), el.getAttribute('data-longitude'));
            marker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,
                icon: _this.icon,
                position: coordinates,
                map: _this.googleMap,
                title: title
            });

            if (typeof _this.markers[title] === 'undefined') {
                _this.markers[title] = {
                    coordinates: coordinates,
                    marker: marker
                };
            }
        });
    },

    displayInfoWindow: function(content) {
        this.googleMapInfoWindow.setContent(content);

        this.centerAndPanMap();
    },

    resizeMap: function() {
        var yearSelectorHeight = 0;
        this.el.googleMap.style.height = TM.util.getWindowSize() >= 1 ? (window.innerHeight - this.logoHeight) + 'px' : 'auto';
    },

    selectFirstEvent: function() {
        var _this = this;

        setTimeout(function() {
            var eventEl = _this.el.performanceList.querySelector('.h-event.today') ||
                          _this.el.performanceList.querySelector('.h-event.future') ||
                         _this.el.performanceList.querySelector('.h-event:first-child');

            if (eventEl === null) return;

            _this.el.performanceList.scrollTop = eventEl.getPosition()[1] - _this.el.performanceList.getPosition()[1];
            eventEl.click();
        }, 500);
    }
});