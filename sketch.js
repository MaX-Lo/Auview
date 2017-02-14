var song;
var BAR_WIDTH;
var MAX_BAR_HEIGHT;
var LEFT_OFFSET;
var color;

function preload() {
    song = loadSound('music/1.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    song.loop();

    fft = new p5.FFT();
    fft.setInput(song);

    // create a new Amplitude analyzer
    analyzer = new p5.Amplitude();

    // Patch the input to an volume analyzer
    analyzer.setInput(song);
    BAR_WIDTH = Math.round(windowWidth / 128);
    MAX_BAR_HEIGHT = Math.round(windowHeight / 4);
    LEFT_OFFSET = windowWidth/3.5;

    color = [random(0, 255), random(0, 255), random(0, 255)];

    mouseClicked = function () {
        if (song.isPlaying()) {
            song.pause();
        } else {
            song.play();
        }
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


function draw() {

    background(color[0], color[1], color[2]);

    stroke(color[0]-35, color[1]-35, color[2]-35);
    noFill();
    strokeWeight(8);
    rect(25, 25, windowWidth-50, windowHeight-50);

    var spectrum = fft.analyze();
    var sum = 0;
    var median = 0;

    fill(color[0]-35, color[1]-35, color[2]-35);
    noStroke();

    beginShape();
    for (i = 0; i<spectrum.length-384; i++) {
        if (i % BAR_WIDTH == 0) {
            median = sum / BAR_WIDTH;

            var bar_height = (median/255)*MAX_BAR_HEIGHT;
            rect(i + i/4 + LEFT_OFFSET, (height/2)-bar_height, BAR_WIDTH, 2*bar_height);
            sum = 0;
        } else {
            sum += spectrum[i];
        }
    }
    endShape();

    // toggle between play and resume button
    var wm = windowWidth/2;
    var hm = windowHeight/2;
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
