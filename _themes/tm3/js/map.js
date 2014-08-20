var initializeMap = function(callback) {
    // Variables
    var activeClass = 'active',
        currentRow,
        featureOpts = [
            {
                featureType: 'water',
                stylers: [
                    { color: '#81d4fa' }
                ]
            }
        ],
        MY_MAPTYPE_ID = 'custom_style',
        markers = {},
        icon = new google.maps.MarkerImage('/_themes/tm3/img/marker.png', null, null, null, new google.maps.Size(25, 45)),
        infoWindow = new google.maps.InfoWindow(),
        initialZoomLevel = 3,
        logoHeight = parseInt(document.getElementById('logo').getStyle('height')),
        mapWrapper = document.getElementById('map'),
        mapCanvas = document.getElementById('map-canvas'),
        mapOptions = {
            center: new google.maps.LatLng(23.0414243, -83.8188083),
            disableDefaultUI: true,
            draggable: false,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID]
            },
            mapTypeId: MY_MAPTYPE_ID,
            scrollwheel: false,
            zoom: initialZoomLevel
        },
        performanceList = document.getElementById('performance-list'),
        styledMapOptions = {
            name: 'Custom Style'
        };

    var map = new google.maps.Map(mapCanvas, mapOptions);
    var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);
    map.mapTypes.set(MY_MAPTYPE_ID, customMapType);

    var createMarkers = function() {
        var eventEl, coordinates, marker, title;

        [].forEach.call(performanceList.querySelectorAll('.h-event'), function(el) {
            title = el.querySelector('.p-location .p-name');
            title = title ? title.innerHTML : '';
            coordinates = new google.maps.LatLng(el.getAttribute('data-latitude'), el.getAttribute('data-longitude'));
            marker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,
                icon: icon,
                position: coordinates,
                map: map,
                title: title
            });

            if (typeof markers[title] === 'undefined') {
                markers[title] = {
                    coordinates: coordinates,
                    marker: marker
                };
            }
        });
    };

    var selectFirstEvent = function() {
        setTimeout(function() {
            var eventEl = performanceList.querySelector('.h-event.today') || performanceList.querySelector('.h-event.future') || performanceList.querySelector('.h-event:first-child');
            if (eventEl === null) return;
            performanceList.scrollTop = eventEl.getPosition()[1] - performanceList.getPosition()[1];
            eventEl.click();
        }, 500);
    };

    performanceList.addEventListener('click', function(event) {
        event.preventDefault();

        var target = event.target.findParentNodeWithName('ARTICLE');

        var performance = target,
            titleEl = performance.querySelector('.p-location .p-name'),
            title = titleEl ? titleEl.innerHTML : '',
            performanceData = markers[title],
            infoWindowEl = null,
            summary = performance.querySelector('.p-summary'),
            maxWidth = 320;

        if (summary && summary.innerHTML.length > 250)
            maxWidth = window.innerWidth / 2;

        if (currentRow)
            currentRow.toggleClass(activeClass);

        currentRow = performance;
        currentRow.toggleClass(activeClass);

        infoWindow.close();
        infoWindow.setContent(performance.outerHTML);
        infoWindow.setOptions({ maxWidth: maxWidth });
        infoWindow.open(map, performanceData.marker);

        map.setCenter(performanceData.coordinates);

        if (document.querySelector('.gm-style-iw') === null) return;

        map.panBy(-(performanceList.offsetWidth / 2), -((document.querySelector('.gm-style-iw').offsetHeight / 2) + logoHeight));
    });

    createMarkers();
    selectFirstEvent();

    if (callback)
        callback();
    else
        mapWrapper.addClass('fadein');
};

var resizeMap = function() {
    var logo = document.getElementById('logo');
        logoHeight = yearSelectorHeight = 0;

    if (logo) logoHeight = parseInt(logo.getStyle('height'));

    document.getElementById('map').style.height = window.getWindowSize() >= 1 ? (window.innerHeight - logoHeight) + 'px' : 'auto';
};

window.addEventListener('load', function load() {
    window.removeEventListener('load', load, false);

    if (getScreenSize() < 1) return;

    document.querySelector('html').addClass('map');

    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA2Kd093BDPlBJhWykIlVOEHamfG4_8WKo&callback=initializeMap';
    document.body.appendChild(script);

    resizeMap();
});

window.addEventListener('resize', function load() {
    resizeMap();
});