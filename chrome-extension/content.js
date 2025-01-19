console.log("React Chrome Extension content script loaded!");

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