document.addEventListener('DOMContentLoaded', function() {
    var resizeSection = function() {
        if (window.getScreenSize() < 2) return;

        var logo = document.getElementById('logo'),
            logoHeight = parseInt(logo.getStyle('height'));

        document.getElementById('live-recordings').style.height = window.getWindowSize() >= 1 ? (window.innerHeight - logoHeight) + 'px' : 'auto';
    };

    window.addEventListener('resize', function load() {
        resizeSection();
    });

    resizeSection();
});