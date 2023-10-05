// Variables
let currentAudioButton = null;

// Constants
const audioPlayer = new Audio();
const playIconSelector = "[data-id='audio-player-play-icon']";
const stopIconSelector = "[data-id='audio-player-stop-icon']";

// Functions
function toggleAudiButtonIcons(audioButton) {
  audioButton.querySelector(playIconSelector).classList.toggle("hidden");
  audioButton.querySelector(stopIconSelector).classList.toggle("hidden");
}

// Config
audioPlayer.preload = "none";

// Events
audioPlayer.addEventListener("ended", event => {
  toggleAudiButtonIcons(currentAudioButton);
});

document.addEventListener("click", event => {
  const { target } = event;

  if (!target.dataset.url) {
    return;
  }

  if (audioPlayer.getAttribute("src", 1) !== target.dataset.url) {
    audioPlayer.src = target.dataset.url;

    if (currentAudioButton) {
      toggleAudiButtonIcons(currentAudioButton);
    }

    currentAudioButton = target;
  }

  if (!audioPlayer.paused) {
    audioPlayer.pause();
  } else {
    audioPlayer.play();
  }

  toggleAudiButtonIcons(currentAudioButton);
});