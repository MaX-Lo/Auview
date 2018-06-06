var song;
var BAR_WIDTH;
var MAX_BAR_HEIGHT;
var LEFT_OFFSET;

var color;

function preload() {
    song = loadSound('music/1.m4a');
}

function setup() {
    var canvas = this.createCanvas(window.innerWidth, window.innerHeight);
    song.loop();

    fft = new p5.FFT();
    fft.setInput(song);

    // create a new Amplitude analyzer
    analyzer = new p5.Amplitude();

    // Patch the input to an volume analyzer
    analyzer.setInput(song);
    // There should be 64 Bars which take half of the screen width
    BAR_WIDTH = Math.round(window.innerWidth / (64*2));
    // Bars go upwards and downwards and should take at maximum amplitude half of the screen high
    MAX_BAR_HEIGHT = Math.round(window.innerHeight / 4);
    //
    LEFT_OFFSET = window.innerWidth/2 - 32*BAR_WIDTH;

    TIME_TEXT_WIDTH = textWidth('00:00');

    color = [random(255), random(255), random(255)];

    this.mouseClicked = function () {
        if (song.isPlaying()) {
            song.pause();
        } else {
            song.play();
        }
    };

    window.onresize = function () {
        canvas.size(window.innerWidth, window.innerHeight);
        // There should be 64 Bars which take half of the screen width
        BAR_WIDTH = Math.round(window.innerWidth / (64*2));
        // Bars go upwards and downwards and should take at maximum amplitude half of the screen high
        MAX_BAR_HEIGHT = Math.round(window.innerHeight / 4);
        //
        LEFT_OFFSET = window.innerWidth/2 - 32*BAR_WIDTH;
    }

    canvas.drop(gotFile);
}

function resetAnalyzer(newSong) {
    song.stop();
    song = loadSound(newSong);
    fft.setInput(song);
    analyzer.setInput(song);
}

function gotFile(file) {
    if (file.type === 'audio') {
        resetAnalyzer(file);
    } else {
        console.log("The given file isn't an audio file.");
    }
}

function keyPressed() {
    if (keyCode === 32) {
        if (song.isPlaying()) {
            song.pause();
        } else {
            song.play();
        }
    }
}

function formatTime(time) {
    /*** Takes time in seconds and returns time in xx:xx format ***/
    var str;
    // minutes
    if (Math.floor(time/60) === 0) {
        str = "00:";
    } else if (Math.floor(time/60) < 10){
        str =  "0" + Math.floor(time/60) + ":";
    } else {
        str = Math.floor(time/60) + ":";
    }

    // seconds
    if (time%60 === 0) {
        return str + "00";
    } else if (time%60 < 10) {
        return str + "0" + Math.floor(time%60);
    } else{
        return str + Math.floor(time%60);
    }
}

function draw() {

    background(color[0], color[1], color[2]);

    this.noStroke();
    textSize(32);
    text(formatTime(song.currentTime()), (window.innerWidth/2)-(39*BAR_WIDTH)-TIME_TEXT_WIDTH, window.innerHeight/2);
    text(formatTime(song.duration()), (window.innerWidth/2)+(35*BAR_WIDTH), window.innerHeight/2);

    stroke(color[0]-35, color[1]-35, color[2]-35);
    noFill();
    strokeWeight(8);
    rect(25, 25, window.innerWidth-50, window.innerHeight-50);

    var spectrum = fft.analyze();
    var sum = 0;
    var median = 0;
    var level_size = Math.round(spectrum.length/64);    // number of frequencies to sum up to one bar in order
                                                        // to get 64 bars at the end

    fill(color[0]-35, color[1]-35, color[2]-35);
    this.noStroke();

    beginShape();
    for (var i = 0; i<spectrum.length; i++) {
        if (i % level_size === 0) { // average level_size frequencies to one amplitude/bar
            median = sum / level_size;

            var bar_height = (median/255)*MAX_BAR_HEIGHT;
            var x_start = 1.25*(i/level_size)*BAR_WIDTH + LEFT_OFFSET; // 0.25 extra for leaving a little gap between bars
            var y_start = (window.innerHeight/2)-bar_height;
            rect(x_start, y_start, BAR_WIDTH, 2*bar_height);
            sum = 0;
        } else {
            sum += spectrum[i];
        }
    }
    endShape();

    // toggle between play and resume button
    var window_mid = window.innerWidth / 2;
    if (song.isPlaying()) {
        // play button
        rect(window_mid-35, window.innerHeight - 40, 20, -60);
        rect(window_mid-5, window.innerHeight - 40, 20, -60);

    } else {
        // resume button
        triangle(window_mid-30, window.innerHeight-40, window_mid-30, window.innerHeight-100, window_mid+18, window.innerHeight-70);
    }

    // progressbar
    var progress = song.currentTime()/song.duration();
    stroke(color[0]-25, color[1]-25, color[2]-25);
    strokeWeight(15);
    line(50, 50, 50 + progress*(window.innerWidth-100), 50);

}
