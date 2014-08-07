document.addEventListener('DOMContentLoaded', function() {
    (function() {
        var currentQuoteIndex = 0,
            quotes = document.querySelectorAll('.hero .quote'),
            quoteInterval = 8000,
            quoteTimerID;

        if (quotes.length === 0) return;

        quotes[currentQuoteIndex].toggleClass('fadein');

        quoteTimerID = setTimeout(function() {
            quotes[currentQuoteIndex].toggleClass('fadein');

            currentQuoteIndex++;

            if (currentQuoteIndex === quotes.length)
                currentQuoteIndex = 0;

            quotes[currentQuoteIndex].toggleClass('fadein');

            setTimeout(arguments.callee, quoteInterval);
        }, quoteInterval);

        window.addEventListener('unload', function unload() {
            window.removeEventListener('unload', unload, false);
            window.clearTimeout(quoteTimerID);
        });
    })();
});