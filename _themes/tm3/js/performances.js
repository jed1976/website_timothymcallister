document.addEventListener('DOMContentLoaded', function() {
    var content = document.getElementById('content'),
        map = document.getElementById('map'),
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
        map.removeClass('fadein');

        var target = event.target,
            url = '?year=' + target.options[target.selectedIndex].getAttribute('value');

        window.getUrl(url, function(response) {
            map.innerHTML = queryHTML(response, '#map').innerHTML;

            if (window.getScreenSize() > 0)
                initializeMap();
            else
                map.addClass('fadein');
        });

        target.blur();
    });

    var queryString = window.location.search;
    queryString = queryString.substring(1);

    var year = queryString.replace('year=', '') || new Date().getFullYear();

    // @TODO Set date based on URL
    document.getElementById('year-selector').value = year;

    map.addClass('fadein');
});