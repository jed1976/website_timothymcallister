// Variables
let currentAudioButton = null;

// Constants
const audioPlayer = new Audio();
const playIconSelector = "[data-id='audio-player-play-icon']";
const stopIconSelector = "[data-id='audio-player-stop-icon']";

// Config
audioPlayer.preload = "none";

// Events
document.addEventListener("click", event => {
  const { target } = event;

  if (!target.dataset.url) {
    return;
  }

  if (audioPlayer.getAttribute("src", 1) !== target.dataset.url) {
    audioPlayer.src = target.dataset.url;

    if (currentAudioButton) {
      currentAudioButton.querySelector(playIconSelector).classList.remove("hidden");
      currentAudioButton.querySelector(stopIconSelector).classList.add("hidden");
    }

    currentAudioButton = target;
  }

  if (!audioPlayer.paused) {
    audioPlayer.pause();
  } else {
    audioPlayer.play();
  }

  currentAudioButton.querySelector(playIconSelector).classList.toggle("hidden");
  currentAudioButton.querySelector(stopIconSelector).classList.toggle("hidden");
});