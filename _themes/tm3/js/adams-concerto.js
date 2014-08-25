new TM.Module({
	el: {
		messageForm: document.getElementById('message-form')
	},

	padding: 12,

	callbacks: {
		onReady: function() {
			this.resizeVideos();
		},

		onWindowResize: function() {
			this.resizeVideos();
		}
	},

	events: {
        messageForm: {
            submit: {
                action: window.location.href,
                callback: function(form, request) {
                    form.innerHTML = TM.util.queryHTML(request.responseText, '#' + form.id).innerHTML;
                }
            }
        }
	},

    resizeVideos: function() {
        var paddingOffset = TM.util.getWindowSize() > 1 ? this.padding : 0;

        [].forEach.call(document.querySelectorAll('.video'), function(el) {
            var aspectRatio = parseInt(el.getStyle('height')) / parseInt(el.getStyle('width'));

            el.removeAttribute('height');
            el.removeAttribute('width');

            var parentWidth = parseInt(el.parentNode.getStyle('width'));
            el.style.width = (parentWidth - paddingOffset) + 'px';
            el.style.height = ((parentWidth - paddingOffset) * aspectRatio) + 'px';
        });
    }
});