document.addEventListener('DOMContentLoaded', function() {
    var resizeVideos = function(el) {
        var paddingOffset = 60;

        [].forEach.call(document.querySelectorAll('.video'), function(el) {
            var aspectRatio = parseInt(el.getStyle('height')) / parseInt(el.getStyle('width'));

            el.removeAttribute('height');
            el.removeAttribute('width');

            var parentWidth = parseInt(el.parentNode.getStyle('width'));
            el.style.width = (parentWidth - paddingOffset) + 'px';
            el.style.height = ((parentWidth - paddingOffset) * aspectRatio) + 'px';
        });
    };

    resizeVideos();

    window.addEventListener('resize', resizeVideos);
});