new TM.Module({
	el: {
		mapContainer: document.getElementById('map'),
		mapCanvas: document.getElementById('map-canvas'),
		performanceList: document.getElementById('performance-list'),
		yearSelectorWrapper: document.getElementById('year-selector-wrapper'),
		yearSelector: null
	},

	activeClass: 'active',

    currentRow: null,

	infoWindowDelay: 250,

	marker: null,

	maxSummaryLength: 250,

    performanceTitleSelector: '.p-location .p-name',

    performanceSummarySelector: '.p-summary',

    title: document.title + ' - ',

    URLQueryString: null,

	year: null,

    yearParam: 'year=',

	callbacks: {
        onMapLoad: function() {
            var _this = this;

            // Create year selector (if applicable)
            if (this.el.yearSelectorWrapper) {
                this.yearSelector = '<select id="year-selector">';

                [].forEach.call(this.el.yearSelectorWrapper.querySelectorAll('a'), function(el) {
                    yearSelectorValue = el.innerHTML;
                    _this.yearSelector += '<option value="' + yearSelectorValue + '">' + yearSelectorValue + '</option>';
                });

                this.yearSelector += '</select>';
                this.el.yearSelectorWrapper.innerHTML = this.yearSelector;

                this.el.yearSelector = document.getElementById('year-selector');
                this.el.yearSelector.onchange = function(event) {
                    _this.refreshMap.call(_this, event);
                };

                this.updateYearSelectorValue(this.year);
            } else {
                this.refreshMap.call(this);
            }

            this.resizeMap();

            this.el.html.addClass('map');
        },

		onPopState: function(event) {
            if (window.location.pathname === '/') return;

			this.updateYearSelectorValue(event.state);
		},

		onReady: function() {
			var _this = this, yearSelectorValue;

			this.logoHeight = parseInt(this.el.logo.getStyle('height'));
			this.URLQueryString = '?' + this.yearParam;

			// Set year selector value
		    var queryString = window.location.search.substring(1);
		    this.year = queryString.replace('year=', '') || new Date().getFullYear();

			// Create map
			this.googleMap = new TM.Map({
                canvas: this.el.mapCanvas,
                callback: this.callbacks.onMapLoad,
                scope: this
            });
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

                var _this = this,
					target = event.target.findParentNodeWithName('ARTICLE'),
                    performance = target,
                    titleEl = performance.querySelector(this.performanceTitleSelector),
                    title = titleEl ? titleEl.innerHTML : '';

                this.marker = this.googleMap.markers[title];

                if (this.currentRow)
                    this.currentRow.toggleClass(this.activeClass);

                this.currentRow = performance;
                this.currentRow.toggleClass(this.activeClass);

				setTimeout(function() {
	                _this.displayInfoWindow(performance);
				}, this.infoWindowDelay);
            }
        }
	},

	addMarkers: function() {
		var _this = this;

		[].forEach.call(this.el.performanceList.querySelectorAll('.h-event'), function(el) {
			var title = el.querySelector('.p-location .p-name');
			title = title ? title.innerHTML : '';

			_this.googleMap.addMarker(title, el.getAttribute('data-latitude'), el.getAttribute('data-longitude'));
		});
	},

	centerAndPanMap: function() {
		var infoWindow = document.querySelector('.gm-style-iw');
		this.googleMap.centerAndPanMap(this.marker.position, -(this.el.performanceList.offsetWidth / 2), -((infoWindow.offsetHeight / 2) + this.logoHeight));
	},

    displayInfoWindow: function(performance) {
        var summary = performance.querySelector(this.performanceSummarySelector),
        	maxWidth = (summary && summary.innerHTML.length > this.maxSummaryLength) ? Math.round(window.innerWidth / 2) : null;

		this.googleMap.displayInfoWindow(performance.outerHTML, this.marker, maxWidth);
		this.centerAndPanMap();
    },

	refreshMap: function(event) {
		var _this = this, target, url, year = this.year;

		if (event) {
			target = event.target;
			year = target.options[target.selectedIndex].getAttribute('value');
		}

		url = this.URLQueryString + year;

        this.el.mapContainer.removeClass('fadein');

        TM.util.getUrl(url, function(response) {
            _this.el.performanceList.innerHTML = TM.util.queryHTML(response, '#performance-list').innerHTML;

            if (TM.util.getScreenSize() > 0) {
            	_this.googleMap.deleteMarkers();
				_this.addMarkers();
				_this.selectFirstEvent();
            }

			_this.saveHistory(year);
			_this.el.mapContainer.addClass('fadein');
        });

		if (target)
			target.blur();
    },

    resizeMap: function() {
		this.el.mapContainer.style.height = TM.util.getWindowSize() >= 1 ? (window.innerHeight - this.logoHeight) + 'px' : 'auto';
    },

	saveHistory: function(year) {
        if (window.location.pathname === '/') return;

        if (window.history.pushState) {
            window.history.pushState(year, this.title + year, this.URLQueryString + year);
        }
    },

    selectFirstEvent: function() {
        var eventElement =  this.el.performanceList.querySelector('.h-event.today') ||
                      		this.el.performanceList.querySelector('.h-event.future') ||
                     	    this.el.performanceList.querySelector('.h-event:first-child');

        if (eventElement === null) return;

        this.el.performanceList.scrollTop = eventElement.getPosition()[1] - this.el.performanceList.getPosition()[1];
        eventElement.click();
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
