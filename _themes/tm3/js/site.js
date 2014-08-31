new TM.Module({
    el: {
        mailingListForm: document.getElementById('mailing-list-form')
    },

    callbacks: {
        onBeforeUnload: function() {
            if (this.actionLinkEnabled) {
                return;
            }

            this.el.body.removeClass('fadein');
        },

        onLoad: function() {
            this.el.body.addClass('fadein');
            TM.util.toggleLogoOpacity();
        },

        onReady: function() {
            TM.util.updateScreenSizeClass();
            TM.util.loadFastClick();
        },

        onScroll: function(event) {
            TM.util.toggleLogoOpacity(event);
        },

        onTouchMove: function(event) {
            if (event.target.hasClass('scrollable')) {
                event.preventDefault();
            }
        },

        onWindowResize: function(event) {
            TM.util.updateScreenSizeClass();
        }
    },

    events: {
        body: {
            click: function(event) {
                var target = event.target;

                if (target.nodeName !== 'A' && this.el.body.hasClass('checked')) {
                    this.el.body.toggleClass('checked');
                }

                if (target.nodeName === 'A') {
                    this.actionLinkEnabled = target.getAttribute('data-actionlink');
                }
            }
        },

        mailingListForm: {
            submit: {
                action: window.location.href,
                callback: function(form, request) {
                    form.innerHTML = TM.util.queryHTML(request.responseText, '#' + form.id).innerHTML;
                }
            }
        },

        menuToggle: {
            click: function(event) {
                event.preventDefault();
                this.el.body.toggleClass('checked');
            }
        }
    }
});