// new TM.Module({
// 	audioPlayer: null,

// 	currentPlayButton: null,

// 	playingClass: 'playing',

// 	playSampleLabel: 'play',

// 	stopSampleLabel: 'stop',

// 	callbacks: {
// 		onReady: function() {
// 			this.audioPlayer = new TM.AudioPlayer();
// 		}
// 	},

// 	events: {
//         body: {
//             click: function(event) {
// 				var target = event.target;

// 				if (target.hasClass('sample') === false) return;

// 				event.preventDefault();

// 				this.toggleRecordingPlayback(target);
// 			}
// 		}
// 	},

// 	togglePlayButtonLabel: function(button) {
// 	    button.setAttribute('data-icon', button.hasClass(this.playingClass) ? this.playSampleLabel : this.stopSampleLabel);
// 	    button.toggleClass(this.playingClass);
// 	},

// 	toggleRecordingPlayback: function(el) {
// 	    if (this.currentPlayButton) {
// 	        this.togglePlayButtonLabel(this.currentPlayButton);
// 			this.audioPlayer.stop();
// 	    }

// 	    var listItem = el.findParentNodeWithName('article');

// 	    if (el === this.currentPlayButton) {
// 	        this.currentPlayButton = null;
// 	        return;
// 	    }

// 	    this.currentPlayButton = el;

// 	    if (el.hasClass(this.playingClass))
// 	        this.audioPlayer.stop();
// 	    else
// 	        this.audioPlayer.play(listItem.getAttribute('id'));

// 	    this.togglePlayButtonLabel(el);
// 	}
// });