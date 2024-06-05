javascript:(function(){
// Initialize variables for start and end time, pause duration, loop count, and loop status
let startTime = 0;
let endTime = 0;
const pauseDuration = 3; // seconds
let looping = false;
let loopCount = 40;
let currentLoop = 0;

// Get the video element from the page
const video = document.querySelector('video');

// Function to loop the video segment
function loopVideo() {
  if (looping && video.currentTime >= endTime) {
    video.pause();
    currentLoop++;
    console.log(`Loop ${currentLoop} of ${loopCount}`);
    if (currentLoop < loopCount) {
      setTimeout(() => {
        video.currentTime = startTime;
        video.play();
      }, pauseDuration * 1000);
    } else {
      looping = false;
      console.log("Looping complete.");
    }
  }
}

// Event listener to check video time updates
video.addEventListener('timeupdate', loopVideo);

// Function to adjust start and end time
function adjustTime(type, delta) {
  if (type === "start") {
    startTime = Math.max(0, startTime + delta);
  } else if (type === "end") {
    endTime = Math.max(startTime + 0.1, endTime + delta);
  }
  console.log(`Start Time: ${startTime.toFixed(2)}s, End Time: ${endTime.toFixed(2)}s`);
}

// Function to adjust video playback speed
function adjustPlaybackRate(delta) {
  video.playbackRate = Math.max(0.1, video.playbackRate * (1 + delta / 100));
  console.log(`Playback Rate: ${video.playbackRate.toFixed(2)}`);
}

// Event listener for keydown events to control video playback and looping
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'b':
      startTime = video.currentTime;
      console.log(`Start Time set to: ${startTime.toFixed(2)}s`);
      break;
    case 'n':
      endTime = Math.max(startTime + 0.1, video.currentTime);
      looping = true;
      currentLoop = 0;
      console.log(`End Time set to: ${endTime.toFixed(2)}s`);
      break;
    case 'h':
      looping = false;
      console.log("Looping canceled.");
      break;
    case 'a':
      adjustTime("start", -1);
      break;
    case 's':
      adjustTime("start", 1);
      break;
    case 'd':
      adjustTime("end", -1);
      break;
    case 'f':
      adjustTime("end", 1);
      break;
    case 'z':
      adjustTime("start", -0.1);
      break;
    case 'x':
      adjustTime("start", 0.1);
      break;
    case 'c':
      adjustTime("end", -0.1);
      break;
    case 'v':
      adjustTime("end", 0.1);
      break;
    case 'j':
      loopCount = Math.max(1, loopCount - 1);
      console.log(`Loop Count: ${loopCount}`);
      break;
    case 'k':
      loopCount++;
      console.log(`Loop Count: ${loopCount}`);
      break;
    case '1':
      adjustPlaybackRate(-1);
      break;
    case '2':
      adjustPlaybackRate(-3);
      break;
    case '3':
      adjustPlaybackRate(-5);
      break;
    case '4':
      adjustPlaybackRate(1);
      break;
    case '5':
      adjustPlaybackRate(3);
      break;
    case '6':
      adjustPlaybackRate(5);
      break;
    default:
      break;
  }
});

})();
