document.addEventListener('DOMContentLoaded', function() {
    var content = document.getElementById('content'),
        map = document.getElementById('map'),
        yearParam = 'year=',
        URLQueryString = '?' + yearParam,
        year,
        yearSelector = '<select id="year-selector">',
        yearSelectorWrapper = document.getElementById('year-selector-wrapper'),
        title = document.title + ' - ';

    [].forEach.call(yearSelectorWrapper.querySelectorAll('a'), function(el) {
        year = el.innerHTML;
        yearSelector += '<option value="' + year + '">' + year + '</option>';
    });

    yearSelector += '</select>';
    yearSelectorWrapper.innerHTML = yearSelector;

    yearSelector = document.getElementById('year-selector');

    var refreshMap = function(event) {
        map.removeClass('fadein');

        var target = event.target,
            year = target.options[target.selectedIndex].getAttribute('value'),
            url = URLQueryString + year;

        window.getUrl(url, function(response) {
            map.innerHTML = queryHTML(response, '#map').innerHTML;

            if (window.getScreenSize() > 0)
                initializeMap();
            else
                map.addClass('fadein');

            saveHistory(year);
        });

        target.blur();
    };

    var saveHistory = function(year) {
        if (window.history.pushState) {
            window.history.pushState(year, title + year, URLQueryString + year);
        }
    };

    var updateYearSelectorValue = function(year) {
        [].forEach.call(yearSelector.options, function(option, index) {
            if (parseInt(option.label) === parseInt(year)) {
                yearSelector.selectedIndex = index;
                yearSelector.onchange({ target: yearSelector });
                return;
            }
        });
    };

    window.addEventListener('popstate', function(event) {
        updateYearSelectorValue(event.state);
    });

    yearSelector.onchange = refreshMap;

    var queryString = window.location.search;
    queryString = queryString.substring(1);

    year = queryString.replace('year=', '') || new Date().getFullYear();
    updateYearSelectorValue(year);
});