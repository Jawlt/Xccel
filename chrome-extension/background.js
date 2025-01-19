let currentVideoData = null;

// Store video data when received from content script
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "videoUpdate") {
    currentVideoData = message.data;
  }
});

// Initialize when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("React Chrome Extension installed!");
});
