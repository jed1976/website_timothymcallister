// Elements
const $hero = document.getElementById("hero");
const $recordings = document.querySelectorAll("li[data-image]");
const $recordingsList = document.getElementById("recordings-list");
const $siteWrapper = document.getElementById("site-wrapper");

// Constants
const heroClasses = ["blur-3xl"];
const recordingsList = Array.from($recordings);
const scrollTop = 64;
const threshold = 0.25;

// Variables

// Functions
function observeIntersection(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      $hero.classList.add(...heroClasses);
      $hero.style.backgroundImage = `url('${entry.target.dataset.image}')`;
    }
  });
}

// Constants
const observer = new IntersectionObserver(observeIntersection, {
  threshold
});

// Config
recordingsList.forEach(($recordingListItem) => {
  observer.observe($recordingListItem);
});

// Events
window.addEventListener("scroll", event => {
  if (document.scrollingElement.scrollTop < scrollTop) {
    $hero.style.backgroundImage = `url('${$hero.dataset.image}')`;
    $hero.classList.remove(...heroClasses);
  }
})