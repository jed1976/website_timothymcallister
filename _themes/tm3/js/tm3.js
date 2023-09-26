// TM Namespace and objects
TM = {};

// AudioPlayer Object
TM.AudioPlayer = function() {
	this.emptyFile = 'assets/audio/empty.mp3';
	this.fileExtension = '.mp3';
	this.howlerPath = '/_themes/tm3/js/libs/howler.min.js';
	this.previousSound = null;
    this.soundFadeDuration = 1000;
    this.soundToUnload = null;
    this.timer = null;
    this.volumeMax = 1.0;
    this.volumeMin = 0.0;

	var _this = this,
		script = document.createElement('script');

    script.src = this.howlerPath;
    script.addEventListener('load', function() {
        new Howl({ urls: [_this.emptyFile] }).play();
    });
    document.body.appendChild(script);
};

TM.AudioPlayer.prototype.play = function(id) {
    var basePath = 'assets/audio/' + id,
		_this = this;

    if (this.previousSound) {
        this.soundToUnload = this.previousSound;
        this.soundToUnload.fade(this.volumeMax, this.volumeMin, this.soundFadeDuration, function() {
            clearTimeout(_this.soundToUnload.timer1ID);
            _this.soundToUnload.stop();
            _this.soundToUnload.unload();
        });
    }

    this.currentSound = new Howl({
        onplay: function() {
            _this.previousSound = _this.currentSound;

            var duration = (Math.round(this._duration) * 1000) - _this.soundFadeDuration,
                howl = this;

            _this.currentSound.timer1ID = setTimeout(function() {
                howl.fade(_this.volumeMax, _this.volumeMin, _this.soundFadeDuration, function() {
                    clearTimeout(_this.currentSound.timer1ID);
                    howl.stop();
                });
            }, duration);
        },
        urls: [basePath + this.fileExtension]
    }).play().fade(this.volumeMin, this.volumeMax, this.soundFadeDuration);
};

TM.AudioPlayer.prototype.stop = function() {
	var _this = this;

    this.soundToUnload = this.currentSound;
    this.soundToUnload.fade(this.volumeMax, this.volumeMin, this.soundFadeDuration, function() {
        clearTimeout(_this.soundToUnload.timer1ID);
        _this.soundToUnload.stop();
        _this.soundToUnload.unload();
    });
};

// Utilities
TM.util = {};

TM.util.getDocumentHeight = function() {
    return Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );
};
