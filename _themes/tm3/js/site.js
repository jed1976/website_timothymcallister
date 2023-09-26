// Variables
const $menuOpen = document.getElementById("menu-open");
const $menuClose = document.getElementById("menu-close");

// Functions
function toggleQuotes() {
  let currentQuoteIndex = 0;
  let quoteTimerID;
  const opacityClass = "group-[.hero]:opacity-0";
  const quotes = document.querySelectorAll("#hero .quote");
  const quoteInterval = 8000;

  function toggle() {
    quotes[currentQuoteIndex].classList.toggle(opacityClass);

    currentQuoteIndex++;

    if (currentQuoteIndex === quotes.length)
        currentQuoteIndex = 0;

    quotes[currentQuoteIndex].classList.toggle(opacityClass);

    setTimeout(toggle, quoteInterval);
  }

  if (quotes.length === 0) {
    return;
  }

  quotes[currentQuoteIndex].classList.toggle(opacityClass);

  quoteTimerID = setTimeout(toggle, quoteInterval);

  window.addEventListener("unload", function unload() {
    window.removeEventListener("unload", unload, false);
    window.clearTimeout(quoteTimerID);
  });
}

// Events
document.addEventListener("DOMContentLoaded", e => {
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("group/js");
  // TM.util.updateScreenSizeClass();
  toggleQuotes();
});

$menuClose.addEventListener("click", e => {
  $menuOpen.focus();
  document.documentElement.classList.remove("display-menu");
});

$menuOpen.addEventListener("click", e => {
  $menuClose.focus();
  document.documentElement.classList.add("display-menu");
});

window.addEventListener("beforeunload", e => {
  document.body.classList.add("opacity-0");
});

window.addEventListener("load", e => {
  document.body.classList.remove("opacity-0");
});