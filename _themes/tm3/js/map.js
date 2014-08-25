new TM.Module({
	el: {
		mapContainer: document.getElementById('map'),
		mapCanvas: document.getElementById('map-canvas'),
		performanceList: document.getElementById('performance-list'),
		yearSelectorWrapper: document.getElementById('year-selector-wrapper'),
		yearSelector: null
	},

	callbacks: {
		onPopState: function(event) {
			this.updateYearSelectorValue(event.state);
		},

		onReady: function() {
			var _this = this;

			this.logoHeight = parseInt(this.el.logo.getStyle('height'));
			this.year = null;
	        this.yearParam = 'year=';
	        this.title = document.title + ' - ';
	        this.URLQueryString = '?' + this.yearParam;

			// Create year selector
			this.yearSelector = '<select id="year-selector">';

		    [].forEach.call(this.el.yearSelectorWrapper.querySelectorAll('a'), function(el) {
		        _this.year = el.innerHTML;
		        _this.yearSelector += '<option value="' + _this.year + '">' + _this.year + '</option>';
		    });

		    this.yearSelector += '</select>';
		    this.el.yearSelectorWrapper.innerHTML = this.yearSelector;

		    this.el.yearSelector = document.getElementById('year-selector');
		    this.el.yearSelector.onchange = function(event) {
		    	_this.refreshMap.call(_this, event);
		    };

			// Set year selector value
		    var queryString = window.location.search;
		    queryString = queryString.substring(1);

		    this.year = queryString.replace('year=', '') || new Date().getFullYear();
		    this.updateYearSelectorValue(this.year);

			// Create map
			this.googleMap = new TM.Map(this.el.mapCanvas);
			this.resizeMap();

			this.el.html.addClass('map');
		},

        onWindowResize: function() {
            this.resizeMap();
            this.centerAndPanMap();
        }
	},

	events: {
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
        // this.googleMapInfoWindow.close();
        // this.googleMapInfoWindow.open(this.googleMap, this.currentPerformance.marker);
        // this.el.googleMapInfoWindow = document.querySelector('.gm-style-iw');
        // this.googleMap.setCenter(this.currentPerformance.coordinates);
//        this.googleMap.panBy(-(this.el.performanceList.offsetWidth / 2), -((this.el.googleMapInfoWindow.offsetHeight / 2) + this.logoHeight));
    },

	addMarkers: function() {
		var _this = this;

		[].forEach.call(this.el.performanceList.querySelectorAll('.h-event'), function(el) {
			var title = el.querySelector('.p-location .p-name');
			title = title ? title.innerHTML : '';

			_this.googleMap.addMarker(title, el.getAttribute('data-latitude'), el.getAttribute('data-longitude'));
		});
	},

    displayInfoWindow: function(content) {
        this.googleMapInfoWindow.setContent(content);
        this.centerAndPanMap();
    },

	refreshMap: function(event) {
		var _this = this,
			target = event.target,
            year = target.options[target.selectedIndex].getAttribute('value'),
            url = this.URLQueryString + year;

        this.el.mapContainer.removeClass('fadein');

        TM.util.getUrl(url, function(response) {
            _this.el.performanceList.innerHTML = TM.util.queryHTML(response, '#performance-list').innerHTML;

            if (TM.util.getScreenSize() > 0) {
            	_this.googleMap.deleteMarkers();
				_this.addMarkers();
            }

			_this.saveHistory(year);
			_this.el.mapContainer.addClass('fadein');
        });

        target.blur();
    },

    resizeMap: function() {
		this.el.mapContainer.style.height = TM.util.getWindowSize() >= 1 ? (window.innerHeight - this.logoHeight) + 'px' : 'auto';
    },

	saveHistory: function(year) {
        if (window.history.pushState) {
            window.history.pushState(this.year, this.title + this.year, this.URLQueryString + this.year);
        }
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
    },

	updateYearSelectorValue: function(year) {
		var _this = this;

        [].forEach.call(this.el.yearSelector.options, function(option, index) {
            if (parseInt(option.label) === parseInt(year)) {
                _this.el.yearSelector.selectedIndex = index;
                _this.el.yearSelector.onchange({ target: _this.el.yearSelector });
                return;
            }
        });
    }

});