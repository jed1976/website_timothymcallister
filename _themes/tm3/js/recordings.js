var canvasDimension = 28,
    playSampleLabel = 'Play Sample',
    stopSampleLabel = 'Stop Playing',
    overlays = [
        '<canvas class="display-none" height="' + canvasDimension + '" id="blur-context" width="' + canvasDimension + '"></canvas>',
        '<div id="current-recording-overlay"></div>',
        '<div id="next-recording-overlay"></div>',
        '<div class="fixed overlay"></div>'
    ].join('');

// Insert overlays
document.getElementById('content').insertStringBefore(overlays);

// Insert Play Sample buttons
[].forEach.call(document.querySelectorAll('#content .button.sample:first-of-type'), function(el) {
    el.insertStringBefore('<span class="sample button light x-small pad">' + playSampleLabel + '</span>');
});

// Variables
var blurRadius = canvasDimension / 8,
    canvas = document.querySelector('canvas'),
    canvasContext = canvas.getContext('2d'),
    changeNextRecordingImage = false,
    currentPlayButton = null,
    currentPosition = 0,
    currentRecording = nextRecording = previousRecording = null,
    currentRecordingOverlay = document.getElementById('current-recording-overlay'),
    currentSound = null,
    distance = 0,
    nextRecordingOverlay = document.getElementById('next-recording-overlay'),
    playingClass = 'playing',
    previousPosition = 0,
    previousSound = null,
    recordingIndex = 0,
    recordingsList = document.getElementById('recordings-list'),
    recordingItems = recordingsList.querySelectorAll('li.recording'),
    recordings = {},
    recordingsToLoad = 2,
    scroller = null;
soundFadeDuration = 1000,
soundToUnload = null,
timer = null,
totalRecordings = recordingItems.length - 1,
volumeMax = 1.0,
volumeMin = 0.0;

// Functions
var cacheRecording = function(index, recording) {
    if (typeof recording === 'undefined') return;

    var el = recording,
        cachedRecording = recordings[index] = {
            blurredImage: null,
            dom: el,
            id: el.getAttribute('id'),
            image: null,
            index: index
        },
        p = new promise.Promise(),
        image = el.querySelector('img');

    if (image.complete) {
        cachedRecording.image = image;
        createVisualEffects(cachedRecording.index, cachedRecording.image, function(recording) {
            p.done(null, recording);
        });
    } else {
        image.addEventListener('load', function() {
            cachedRecording.image = image;
            createVisualEffects(cachedRecording.index, cachedRecording.image, function(recording) {
                p.done(null, recording);
            });
        });
    }

    return p;
};

var changeOpacity = function() {
    nextRecordingOverlay.style.opacity = (100 - Math.round(((nextRecording.dom.getPosition()[1] - currentPosition) / distance) * 100)) / 100;
};

var createVisualEffects = function(index, image, callback) {
    canvasContext.drawImage(image, 0, 0, canvasDimension, canvasDimension);
    stackBlurCanvasRGB('blur-context', 0, 0, canvasDimension, canvasDimension, blurRadius);
    recordings[index].blurredImage = canvas.toDataURL();
    callback(recordings[index]);
};

var getRecording = function(index) {
    var p = new promise.Promise();

    if (typeof index === 'undefined') return;

    if (typeof recordings[index] === 'undefined')
        cacheRecording(index, recordingItems[index]).then(function(error, recording) {
            p.done(null, recording);
        });
    else
        p.done(null, recordings[index]);

    return p;
};

var getNextRecordingIndex = function(direction) {
    currentPosition = window.getScreenSize() < 2 ? Math.abs(scroller.y) : window.pageYOffset;

    if (direction === 1) {
        for (var i = 0, l = recordingItems.length; i < l; i++) {
            var el = recordingItems[i];

            if (el.getPosition()[1] >= currentPosition) {
                return el.index();
            }
        };

        return totalRecordings;
    } else {
        for (var i = currentRecording.dom.index(), l = currentRecording.dom.index(); i >= 0; i--) {
            var el = recordingItems[i];

            if (el.getPosition()[1] <= currentPosition) {
                return el.index();
            }
        };

        return 0;
    }

    return 0;
};

var init = function() {
    primeAudioPlayer();

    getRecording(getNextRecordingIndex(1)).then(function(error, recording) {
        currentRecording = recording;

        getRecording(getNextRecordingIndex(1)).then(function(error, recording) {
            nextRecording = recording;
            previousRecording = currentRecording;
            distance = nextRecording.dom.getPosition()[1] - currentRecording.dom.getPosition()[1];

            setCurrentRecordingBackground(currentRecording);
            setNextRecordingBackground(nextRecording);
            updateBackgroundImages();
        });
    });
};

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

var prepareNextRecording = function() {
    recordingIndex = getNextRecordingIndex(1);

    getRecording(recordingIndex).then(function(error, recording) {
        previousRecording = currentRecording;
        currentRecording = nextRecording;
        nextRecording = recording;

        distance = nextRecording.dom.getPosition()[1] - currentRecording.dom.getPosition()[1];

        setCurrentRecordingBackground(currentRecording);
        setNextRecordingBackground(nextRecording);
    });
};

var preparePreviousRecording = function() {
    recordingIndex = getNextRecordingIndex(0);

    getRecording(recordingIndex).then(function(error, recording) {
        previousRecording = currentRecording;
        nextRecording = currentRecording;
        currentRecording = recording;

        distance = nextRecording.dom.getPosition()[1] - currentRecording.dom.getPosition()[1];

        setNextRecordingBackground(nextRecording);
        setCurrentRecordingBackground(currentRecording);
    });
};

var primeAudioPlayer = function() {
    // Play an empty sound file to prime the audio engine in iOS
    new Howl({
        urls: ['assets/audio/empty.mp3', 'assets/audio/empty.ogg']
    }).play();
};

var setCurrentRecordingBackground = function(recording) {
    currentRecordingOverlay.style.backgroundImage = 'url(' + recording.blurredImage + ')';
};

var setNextRecordingBackground = function(recording) {
    nextRecordingOverlay.style.backgroundImage = 'url(' + recording.blurredImage + ')';
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
    button.innerHTML = button.hasClass(playingClass) ? playSampleLabel : stopSampleLabel;
    button.toggleClass(playingClass);
};

var toggleRecordingPlayback = function(el) {
    if (currentPlayButton) {
        togglePlayButtonLabel(currentPlayButton);
        stopSound(currentSound);
    }

    var listItem = el.findParentNodeWithName('LI');

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

var updateBackgroundImages = function() {
    previousPosition = currentPosition;
    currentPosition = window.getScreenSize() < 2 ? Math.abs(this.y) : window.pageYOffset;

    if (currentPosition > nextRecording.dom.getPosition()[1])
        prepareNextRecording();
    else if (currentPosition < currentRecording.dom.getPosition()[1]) {
        preparePreviousRecording();
    }

    changeOpacity();
};

// Events
window.addEventListener('resize', updateBackgroundImages);

document.addEventListener('scroll', updateBackgroundImages);

document.body.addEventListener('click', function(event) {
    var el = event.target;

    if (!el.hasClass('nav-button')) return;

    document.body.removeClass('fadein');
    document.body.addEventListener('transitionend', function transitionend() {
        document.body.removeEventListener('transitionend', transitionend);

        window.scrollTo(0, window.getDocumentHeight());
        setTimeout(function() {
            window.scrollTo(0, document.getElementById(el.getAttribute('href', 1).replace('#', '')).getPosition()[1]);
        }, 10);

        document.body.addClass('fadein');
    });

    updateBackgroundImages();
});

document.body.addEventListener('click', function(event) {
    var target = event.target;

    if (target.hasClass('sample') === false) return;

    toggleRecordingPlayback(target);
});

// IScroll only for smaller screens
if (window.getScreenSize() < 2) {
    document.addEventListener('touchmove', function(e) {
        if (document.querySelector('#menu-toggle').hasClass('checked') === false)
            e.preventDefault();
    });

    var script = document.createElement('script');
    script.src = '/_themes/tm3/js/iscroll-probe.js';
    script.addEventListener('load', function() {
        window.addEventListener('orientationchange', function() {
            updateBackgroundImages();
            scroller.refresh();
        });

        scroller = new IScroll('#content', {
            deceleration: 0.003,
            eventPassthrough: 'horizontal',
            fadeScrollbars: true,
            probeType: 3,
            scrollbars: true
        });
        scroller.on('scroll', updateBackgroundImages);
        scroller.on('scroll', toggleLogoOpacity);
    });

    document.body.appendChild(script);
}

window.addEventListener('load', function() {
    init();
});