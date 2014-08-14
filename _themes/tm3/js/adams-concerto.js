document.addEventListener('DOMContentLoaded', function() {
    var resizeVideos = function(el) {
        var paddingOffset = 48;

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

    // Listeners
    window.addEventListener('resize', resizeVideos);

    addFormSubmissionHandler(document.getElementById('message-form'), window.location.href, function(form, request) {
        form.innerHTML = queryHTML(request.responseText, '#' + form.id).innerHTML;
    });
});