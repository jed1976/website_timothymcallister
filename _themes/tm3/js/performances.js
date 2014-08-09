document.addEventListener('DOMContentLoaded', function() {
    var map = document.getElementById('map'),
        year,
        yearSelector = '<select id="year-selector">',
        yearSelectorWrapper = document.getElementById('year-selector-wrapper');

    [].forEach.call(yearSelectorWrapper.querySelectorAll('a'), function(el) {
        year = el.innerHTML;
        yearSelector += '<option value="' + year + '">' + year + '</option>';
    });

    yearSelector += '</select>';
    yearSelectorWrapper.innerHTML = yearSelector;

    document.getElementById('year-selector').addEventListener('change', function(event) {
        map.toggleClass('fadeout');

        var target = event.target,
            url = '?year=' + target.options[target.selectedIndex].getAttribute('value');

        if (window.getScreenSize() > 1) {
            window.getUrl(url, function(response) {
                map.innerHTML = queryHTML(response, '#map').innerHTML;
                initializeMap(function() {
                    map.toggleClass('fadeout');
                });
            });
        } else {
            window.location.href = url;
        }

        target.blur();
    });

    var queryString = window.location.search;
    queryString = queryString.substring(1);

    var year = queryString.replace('year=', '') || new Date().getFullYear();

    // @TODO Set date based on URL
    document.getElementById('year-selector').value = year;
});