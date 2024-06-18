javascript:(function(){
    let startTime = 0;
    let endTime = 0;
    let looping = false;
    let loopCount = 50;
    let currentLoop = 0;
    let isPaused = false;
    let isHidden = false;
    let fontSize = 14;
    let countdownTime = 0;
    let countdownInterval;
    let hKeyPressCount = 0;

    const video = document.querySelector('video');
    video.volume = 0.5; 
    video.playbackRate = 0.8;

    const infoDiv =
