var currentPlayButton = null,
    playSampleLabel = 'play',
    playingClass = 'playing',
    previousSound = null,
    stopSampleLabel = 'stop',
    soundFadeDuration = 1000,
    soundToUnload = null,
    timer = null,
    volumeMax = 1.0,
    volumeMin = 0.0;

var playRecording = function(id) {
    if (previousSound) {
        soundToUnload = previousSound;
        soundToUnload.fade(volumeMax, volumeMin, soundFadeDuration, function() {
            clearTimeout(soundToUnload.timer1ID);

            soundToUnload.stop();
            soundToUnload.unload();
        });
    }

    playSound(id);
};

var playSound = function(id) {
    var basePath = 'assets/audio/' + id;

    currentSound = new Howl({
        onplay: function() {
            previousSound = currentSound;

            var duration = (Math.round(this._duration) * 1000) - soundFadeDuration,
                _this = this;

            currentSound.timer1ID = setTimeout(function() {
                _this.fade(volumeMax, volumeMin, soundFadeDuration, function() {
                    clearTimeout(currentSound.timer1ID);
                    _this.stop();
                });
            }, duration);
        },
        urls: [basePath + '.mp3', basePath + '.ogg']
    }).play().fade(volumeMin, volumeMax, soundFadeDuration);
};

var primeAudioPlayer = function() {
    // Play an empty sound file to prime the audio engine in iOS
    new Howl({
        urls: ['assets/audio/empty.mp3', 'assets/audio/empty.ogg']
    }).play();
};

var stopSound = function(sound) {
    soundToUnload = sound;
    soundToUnload.fade(volumeMax, volumeMin, soundFadeDuration, function() {
        clearTimeout(soundToUnload.timer1ID);

        soundToUnload.stop();
        soundToUnload.unload();
    });
};

var togglePlayButtonLabel = function(button) {
    button.setAttribute('data-icon', button.hasClass(playingClass) ? playSampleLabel : stopSampleLabel);
    button.toggleClass(playingClass);
};

var toggleRecordingPlayback = function(el) {
    if (currentPlayButton) {
        togglePlayButtonLabel(currentPlayButton);
        stopSound(currentSound);
    }

    var listItem = el.findParentNodeWithName('ARTICLE');

    if (el === currentPlayButton) {
        currentPlayButton = null;
        return;
    }

    currentPlayButton = el;

    if (el.hasClass(playingClass))
        stopSound(currentSound);
    else
        playRecording(listItem.getAttribute('id'));

    togglePlayButtonLabel(el);
};

var init = function() {
    var script = document.createElement('script');
    script.src = '/_themes/tm3/js/howler.min.js';
    script.addEventListener('load', function() {
        primeAudioPlayer();
    });
    document.body.appendChild(script);
};

document.addEventListener('click', function(event) {
    var target = event.target;

    if (target.hasClass('sample') === false) return;

    event.preventDefault();

    toggleRecordingPlayback(target);
});

init();