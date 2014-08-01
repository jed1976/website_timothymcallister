document.addEventListener('DOMContentLoaded', function() {
    window.createQuoteCarousel();

    var year,
        yearSelector = '<select id="year-selector">',
        yearSelectorWrapper = document.getElementById('year-selector-wrapper');

    [].forEach.call(yearSelectorWrapper.querySelectorAll('a'), function(el) {
        year = el.innerHTML;
        yearSelector += '<option value="' + year + '">' + year + '</option>';
    });

    yearSelector += '</select>';
    yearSelectorWrapper.innerHTML = yearSelector;

    document.getElementById('year-selector').addEventListener('change', function(event) {
        var target = event.target;

        window.location.href = '?year=' + target.options[target.selectedIndex].getAttribute('value');

        target.blur();
    });

    var queryString = window.location.search;
    queryString = queryString.substring(1);

    var year = queryString.replace('year=', '') || new Date().getFullYear();

    // @TODO Set date based on URL
    document.getElementById('year-selector').value = year;
});