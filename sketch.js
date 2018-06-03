var song;
var BAR_WIDTH;
var MAX_BAR_HEIGHT;
var LEFT_OFFSET;

var color;

function preload() {
    song = loadSound('music/1.m4a');
}

function setup() {
    var canv = createCanvas(windowWidth, windowHeight);
    song.loop();

    fft = new p5.FFT();
    fft.setInput(song);

    // create a new Amplitude analyzer
    analyzer = new p5.Amplitude();

    // Patch the input to an volume analyzer
    analyzer.setInput(song);
    // There should be 64 Bars which take half of the screen width
    BAR_WIDTH = Math.round(windowWidth / (64*2));
    // Bars go upwards and downwards and should take at maximum amplitude half of the screen high
    MAX_BAR_HEIGHT = Math.round(windowHeight / 4);
    //
    LEFT_OFFSET = windowWidth/2 - 32*BAR_WIDTH;

    color = [random(255), random(255), random(255)];

    mouseClicked = function () {
        if (song.isPlaying()) {
            song.pause();
        } else {
            song.play();
        }
    };

    canv.drop(gotFile);
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

    noStroke();
    textSize(32);
    text(formatTime(song.currentTime()), (windowWidth/2)-(39*BAR_WIDTH), windowHeight/2);
    text(formatTime(song.duration()), (windowWidth/2)+(35*BAR_WIDTH), windowHeight/2);

    stroke(color[0]-35, color[1]-35, color[2]-35);
    noFill();
    strokeWeight(8);
    rect(25, 25, windowWidth-50, windowHeight-50);

    var spectrum = fft.analyze();
    var sum = 0;
    var median = 0;
    var level_size = Math.round(spectrum.length/64);    // number of frequencies to sum up to one bar in order
                                                        // to get 64 bars at the end

    fill(color[0]-35, color[1]-35, color[2]-35);
    noStroke();

    beginShape();
    for (i = 0; i<spectrum.length; i++) {
        if (i % level_size == 0) { // average level_size frequencies to one amplitude/bar
            median = sum / level_size;

            var bar_height = (median/255)*MAX_BAR_HEIGHT;
            var x_start = 1.25*(i/level_size)*BAR_WIDTH + LEFT_OFFSET; // 0.25 extra for leaving a little gap between bars
            var y_start = (height/2)-bar_height;
            rect(x_start, y_start, BAR_WIDTH, 2*bar_height);
            sum = 0;
        } else {
            sum += spectrum[i];
        }
    }
    endShape();

    // toggle between play and resume button
    var wm = windowWidth/2;
    if (song.isPlaying()) {
        // play button
        rect(wm-35, windowHeight-(windowHeight/10)+30, 20, -60);
        rect(wm-5, windowHeight-(windowHeight/10)+30, 20, -60);

    } else {
        // resume button
        triangle(wm-30, windowHeight-(windowHeight/10)-30, wm-30, windowHeight-(windowHeight/10)+30, wm+18, windowHeight-(windowHeight/10));
    }

    // progressbar
    var progress = song.currentTime()/song.duration();
    stroke(color[0]-25, color[1]-25, color[2]-25);
    strokeWeight(15);
    line(50, 50, 100 + progress*(windowWidth-200), 50);

}
