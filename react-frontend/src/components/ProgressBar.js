import React, { useState, useEffect } from 'react';
import './ProgressBar.css';

const ProgressBar = ({ timestamps = [] }) => {
  console.log("ProgressBar received timestamps:", timestamps);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [hasVideo, setHasVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    let interval;

    if (isExtension) {
      interval = setInterval(() => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          const url = tabs[0].url;
          if (url.includes('youtube.com/watch')) {
            setHasVideo(true);
            setVideoUrl(url);
            chrome.tabs.sendMessage(tabs[0].id, {action: "getVideoTime"}, response => {
              if (response) {
                setCurrentTime(response.currentTime);
                setProgress(response.progress);
                setVideoDuration(response.duration);
                console.log("Video duration:", response.duration);
              }
            });
          } else {
            setHasVideo(false);
            setVideoUrl('');
          }
        });
      }, 1000);
    } else {
      setHasVideo(true);
      setVideoUrl('https://www.youtube.com/watch?v=example');
      setVideoDuration(600);
      
      interval = setInterval(() => {
        setProgress(prev => (prev + 1) % 100);
        const totalSeconds = Math.floor((progress / 100) * 600);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, []);

  const timestampToSeconds = (timestamp) => {
    const parts = timestamp.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const handleTimestampClick = (timestamp) => {
    const seconds = timestampToSeconds(timestamp);
    console.log("Seeking to timestamp:", timestamp, "seconds:", seconds);
    
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "seekTo",
          time: seconds
        });
      });
    }
  };

  return (
    <div className="progress-container">
      <div className="progress-wrapper">
        <div className="url-container">
          <span className="url-text">
            {hasVideo ? `URL: ${videoUrl}` : 'No video detected'}
          </span>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          {timestamps.map((timestamp, index) => {
            const seconds = timestampToSeconds(timestamp);
            const position = (seconds / videoDuration) * 100;
            console.log("Rendering timestamp:", timestamp, "at position:", position);
            
            return (
              <div
                key={`${timestamp}-${index}`}
                className="timestamp-marker"
                style={{ left: `${position}%` }}
                onClick={() => handleTimestampClick(timestamp)}
                title={timestamp}
              >
                <div className="timestamp-tooltip">{timestamp}</div>
              </div>
            );
          })}
        </div>
        {hasVideo && (
          <div 
            className="time-display" 
            style={{ 
              left: `${progress}%`,
              opacity: hasVideo ? 1 : 0
            }}
          >
            {currentTime}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;