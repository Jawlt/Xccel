console.log("Video tracking content script loaded!");

// Function to get current video time and progress
function getVideoTime() {
  const video = document.querySelector('video');
  if (video) {
    const currentTime = formatTime(video.currentTime);
    const progress = (video.currentTime / video.duration) * 100;
    return { currentTime, progress };
  }
  return null;
}

// Format time from seconds to MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

// Also keep the message listener for direct requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getVideoTime") {
    sendResponse(getVideoTime());
  }
  return true;
});