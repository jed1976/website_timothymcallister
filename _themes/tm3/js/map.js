var initializeMap = function(callback) {
    document.querySelector('html').addClass('map');

    // Variables
    var activeClass = 'active',
        currentRow,
        markers = {},
        icon = new google.maps.MarkerImage('/_themes/tm3/img/marker.png', null, null, null, new google.maps.Size(25, 45)),
        infoWindow = new google.maps.InfoWindow({
            maxWidth: 320
        }),
        initialZoomLevel = 3,
        logoHeight = parseInt(document.getElementById('logo').getStyle('height')),
        mapCanvas = document.getElementById('map-canvas'),
        mapOptions = {
            center: new google.maps.LatLng(23.0414243, -83.8188083),
            disableDefaultUI: true,
            draggable: false,
            scrollwheel: false,
            zoom: initialZoomLevel
        },
        performanceList = document.getElementById('performance-list');

    var map = new google.maps.Map(mapCanvas, mapOptions);

    var createMarkers = function() {
        var eventEl, coordinates, marker, title;

        [].forEach.call(performanceList.querySelectorAll('.h-event'), function(el) {
            title = el.querySelector('.p-location .p-name');
            title = title ? title.innerHTML : '';
            coordinates = new google.maps.LatLng(el.dataset.latitude, el.dataset.longitude);
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
            var eventEl = performanceList.querySelector('.h-event.today') || performanceList.querySelector('.h-event.future');
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
            infoWindowEl = null;

        if (currentRow)
            currentRow.toggleClass(activeClass);

        currentRow = performance;
        currentRow.toggleClass(activeClass);

        infoWindow.close();
        infoWindow.setContent(performance.outerHTML);
        infoWindow.open(map, performanceData.marker);

        map.setCenter(performanceData.coordinates);
        map.panBy(-(performanceList.offsetWidth / 2), -((document.querySelector('.gm-style-iw').offsetHeight / 2) + logoHeight));
    });

    createMarkers();
    selectFirstEvent();

    if (callback)
        callback();
};

var resizeMap = function() {
    var logoHeight = parseInt(document.getElementById('logo').getStyle('height'));
        headerHeight = parseInt(document.getElementById('content').querySelector('.style-1').getStyle('height'));

    document.getElementById('map').style.height = window.getWindowSize() > 1 ? (window.innerHeight - logoHeight - (headerHeight * 2) - 20) + 'px' : 'auto';
};

window.addEventListener('load', function load() {
    window.removeEventListener('load', load, false);

    if (getScreenSize() < 1) return;

    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA2Kd093BDPlBJhWykIlVOEHamfG4_8WKo&callback=initializeMap';
    document.body.appendChild(script);

    resizeMap();
});

window.addEventListener('resize', function load() {
    resizeMap();
});