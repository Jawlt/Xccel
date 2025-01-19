console.log("Video tracking content script loaded!");

window.requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted:', stream);
      return true; // Access granted
    } catch (error) {
      console.error('Error accessing microphone:', error);
      return false; // Access denied
    }
  };

// Function to get current video time and progress
function getVideoTime() {
  const video = document.querySelector('video');
  if (video) {
    const currentTime = formatTime(video.currentTime);
    const duration = video.duration;
    const progress = (video.currentTime / duration) * 100;
    return { currentTime, progress, duration };
  }
  return null;
}

// Format time from seconds to MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Convert timestamp string to seconds
function timestampToSeconds(timestamp) {
  const [minutes, seconds] = timestamp.split(':').map(Number);
  return minutes * 60 + seconds;
}

// Seek video to specific time
function seekToTime(seconds) {
  const video = document.querySelector('video');
  if (video) {
    video.currentTime = seconds;
  }
}

// Continuously monitor video and send updates to background script
function monitorVideo() {
  setInterval(() => {
    const videoData = getVideoTime();
    if (videoData) {
      chrome.runtime.sendMessage({
        action: "videoUpdate",
        data: videoData
      });
    }
  }, 1000);
}

// Start monitoring when script loads
monitorVideo();

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getVideoTime") {
    sendResponse(getVideoTime());
  } else if (request.action === "seekTo") {
    seekToTime(request.time);
    sendResponse({ success: true });
  }
  return true;
});
