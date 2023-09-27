


// var canvasDimension = 28,
//     overlays = [
//         '<canvas class="display-none" height="' + canvasDimension + '" id="blur-context" width="' + canvasDimension + '"></canvas>',
//         '<div id="current-recording-overlay"></div>',
//         '<div id="next-recording-overlay"></div>',
//         '<div class="fixed overlay"></div>'
//     ].join('');

// // Insert overlays
// document.getElementById('site-wrapper').insertStringBefore(overlays);

// // Variables
// var blurRadius = canvasDimension / 8,
//     canvas = document.querySelector('canvas'),
//     canvasContext = canvas.getContext('2d'),
//     changeNextRecordingImage = false,
//     currentPosition = 0,
//     currentRecording = nextRecording = previousRecording = null,
//     currentRecordingOverlay = document.getElementById('current-recording-overlay'),
//     currentSound = null,
//     distance = 0,
//     nextRecordingOverlay = document.getElementById('next-recording-overlay'),
//     previousPosition = 0,
//     recordingIndex = 0,
//     recordingsList = document.getElementById('recordings-list'),
//     recordingItems = recordingsList.querySelectorAll('li.recording'),
//     recordings = {},
//     scrollOffset = 100,
//     scroller = { y: 0 },
//     totalRecordings = recordingItems.length - 1;

// // Functions
// var cacheRecording = function(index, recording) {
//     if (typeof recording === 'undefined') return;

//     var el = recording,
//         cachedRecording = recordings[index] = {
//             blurredImage: null,
//             dom: el,
//             id: el.getAttribute('id'),
//             image: null,
//             index: index
//         },
//         p = new promise.Promise(),
//         image = el.querySelector('img');

//     if (image.complete) {
//         cachedRecording.image = image;
//         createVisualEffects(cachedRecording.index, cachedRecording.image, function(recording) {
//             p.done(null, recording);
//         });
//     } else {
//         image.addEventListener('load', function() {
//             cachedRecording.image = image;
//             createVisualEffects(cachedRecording.index, cachedRecording.image, function(recording) {
//                 p.done(null, recording);
//             });
//         });
//     }

//     return p;
// };

// var changeOpacity = function() {
//     nextRecordingOverlay.style.opacity = (100 - Math.round(((nextRecording.dom.getPosition()[1] - currentPosition) / distance) * 100)) / 100;
// };

// var createVisualEffects = function(index, image, callback) {
//     canvasContext.drawImage(image, 0, 0, canvasDimension, canvasDimension);
//     stackBlurCanvasRGB('blur-context', 0, 0, canvasDimension, canvasDimension, blurRadius);
//     recordings[index].blurredImage = canvas.toDataURL();
//     callback(recordings[index]);
// };

// var getRecording = function(index) {
//     var p = new promise.Promise();

//     if (typeof index === 'undefined') return;

//     if (typeof recordings[index] === 'undefined')
//         cacheRecording(index, recordingItems[index]).then(function(error, recording) {
//             p.done(null, recording);
//         });
//     else
//         p.done(null, recordings[index]);

//     return p;
// };

// var getNextRecordingIndex = function(direction) {
//     currentPosition = TM.util.getScreenSize() < 2 ? Math.abs(scroller.y) : window.pageYOffset;

//     if (direction === 1) {
//         for (var i = 0, l = recordingItems.length; i < l; i++) {
//             var el = recordingItems[i];

//             if (el.getPosition()[1] >= currentPosition) {
//                 return el.index();
//             }
//         };

//         return totalRecordings;
//     } else {
//         for (var i = currentRecording.dom.index(), l = currentRecording.dom.index(); i >= 0; i--) {
//             var el = recordingItems[i];

//             if (el.getPosition()[1] <= currentPosition) {
//                 return el.index();
//             }
//         };

//         return 0;
//     }

//     return 0;
// };

// var init = function() {
//     getRecording(getNextRecordingIndex(1)).then(function(error, recording) {
//         currentRecording = recording;

//         getRecording(getNextRecordingIndex(1)).then(function(error, recording) {
//             nextRecording = recording;
//             previousRecording = currentRecording;
//             distance = nextRecording.dom.getPosition()[1] - currentRecording.dom.getPosition()[1];

//             setCurrentRecordingBackground(currentRecording);
//             setNextRecordingBackground(nextRecording);
//             updateBackgroundImages();

//             window.addEventListener('resize', updateBackgroundImages);
//             document.addEventListener('scroll', updateBackgroundImages);

//             setTimeout(function() {
//                 loadScroller();
//             }, 0)
//         });
//     });
// };

// var loadScroller = function() {
//     if (TM.util.getScreenSize() > 1) return;

//     document.addEventListener('touchmove', function(e) {
//         if (document.querySelector('#menu-toggle').hasClass('checked') === false)
//             e.preventDefault();
//     });

//     var script = document.createElement('script');
//     script.src = '/_themes/tm3/js/libs/iscroll-probe.min.js';
//     script.addEventListener('load', function() {
//         window.addEventListener('orientationchange', function() {
//             updateBackgroundImages();

//             setTimeout(function() {
//                 scroller.refresh();
//             }, 0);
//         });

//         scroller = new IScroll('#site-wrapper', {
//             freeScroll: true,
//             probeType: 3,
//             scrollbars: true
//         });

//         scroller.on('scroll', updateBackgroundImages);
//         scroller.on('scroll', TM.util.toggleLogoOpacity);

//         setTimeout(function() {
//             scroller.refresh();
//         }, 0);
//     });

//     document.body.appendChild(script);
// };

// var prepareNextRecording = function() {
//     recordingIndex = getNextRecordingIndex(1);

//     getRecording(recordingIndex).then(function(error, recording) {
//         previousRecording = currentRecording;
//         currentRecording = nextRecording;
//         nextRecording = recording;

//         distance = nextRecording.dom.getPosition()[1] - currentRecording.dom.getPosition()[1];

//         setCurrentRecordingBackground(currentRecording);
//         setNextRecordingBackground(nextRecording);
//     });
// };

// var preparePreviousRecording = function() {
//     recordingIndex = getNextRecordingIndex(0);

//     getRecording(recordingIndex).then(function(error, recording) {
//         previousRecording = currentRecording;
//         nextRecording = currentRecording;
//         currentRecording = recording;

//         distance = nextRecording.dom.getPosition()[1] - currentRecording.dom.getPosition()[1];

//         setNextRecordingBackground(nextRecording);
//         setCurrentRecordingBackground(currentRecording);
//     });
// };

// var setCurrentRecordingBackground = function(recording) {
//     currentRecordingOverlay.style.backgroundImage = 'url(' + recording.blurredImage + ')';
// };

// var setNextRecordingBackground = function(recording) {
//     nextRecordingOverlay.style.backgroundImage = 'url(' + recording.blurredImage + ')';
// };

// var updateBackgroundImages = function() {
//     previousPosition = currentPosition;
//     currentPosition = TM.util.getScreenSize() < 2 ? Math.abs(this.y) : window.pageYOffset;

//     if (currentPosition > nextRecording.dom.getPosition()[1])
//         prepareNextRecording();
//     else if (currentPosition < currentRecording.dom.getPosition()[1]) {
//         preparePreviousRecording();
//     }

//     changeOpacity();
// };

// window.addEventListener('load', function() {
//     init();
// });
