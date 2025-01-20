console.log("Video tracking content script loaded!");

let lastProcessedVideoId = null;
let isProcessingTranscript = false;

window.requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted:', stream);
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      return false;
    }
  };

// Function to extract video ID from YouTube URL
function getYoutubeVideoId(url) {
  const urlObj = new URL(url);
  if (urlObj.hostname.includes('youtube.com')) {
    return urlObj.searchParams.get('v');
  } else if (urlObj.hostname.includes('youtu.be')) {
    return urlObj.pathname.slice(1);
  }
  return null;
}

// Function to get current video time and progress
function getVideoTime() {
  const video = document.querySelector('video');
  if (video) {
    const currentTime = formatTime(video.currentTime);
    const duration = video.duration;
    const progress = (video.currentTime / duration) * 100;
    const videoId = getYoutubeVideoId(window.location.href);
    return { currentTime, progress, duration, videoId };
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

// Function to process new video
async function processNewVideo(videoId) {
  if (!videoId || videoId === lastProcessedVideoId || isProcessingTranscript) {
    return;
  }

  try {
    isProcessingTranscript = true;
    const response = await fetch(`http://localhost:8000/public/transcript/${videoId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log('Transcript processed for video:', videoId);
    lastProcessedVideoId = videoId;
  } catch (error) {
    console.error('Error processing transcript:', error);
  } finally {
    isProcessingTranscript = false;
  }
}

// Monitor URL changes for YouTube navigation
let lastUrl = window.location.href;
new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    const videoId = getYoutubeVideoId(currentUrl);
    if (videoId) {
      processNewVideo(videoId);
    }
  }
}).observe(document, { subtree: true, childList: true });

// Initial check for video
const initialVideoId = getYoutubeVideoId(window.location.href);
if (initialVideoId) {
  processNewVideo(initialVideoId);
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
