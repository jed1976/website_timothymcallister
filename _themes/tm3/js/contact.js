document.addEventListener('DOMContentLoaded', function() {
    submitForm(document.getElementById('mailing-list-form'), window.location.href, function(form, request) {
        form.innerHTML = queryHTML(request.responseText, '#' + form.id).innerHTML;
    });
});