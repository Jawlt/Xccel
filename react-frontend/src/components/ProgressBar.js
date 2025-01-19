/* global chrome */
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faForward, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import './ProgressBar.css';

const ProgressBar = () => {
  const [currentTime, setCurrentTime] = useState('0:00');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [hasVideo, setHasVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const controlVideo = (action, value = null) => {
    const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    
    if (isExtension) {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "videoControl",
          control: action,
          value: value
        });
      });
    }
  };

  const handleSeekBackward = () => {
    controlVideo('seek', -10);
  };

  const handleSeekForward = () => {
    controlVideo('seek', 10);
  };

  const handlePlayPause = () => {
    controlVideo(isPlaying ? 'pause' : 'play');
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    let mockProgress = 0;
    let mockTime = 0;

    const updateProgress = () => {
      if (isExtension) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          const url = tabs[0].url;
          if (url.includes('youtube.com/watch')) {
            setHasVideo(true);
            setVideoUrl(url);
            chrome.tabs.sendMessage(tabs[0].id, {action: "getVideoTime"}, response => {
              if (response && response.currentTime) {
                setCurrentTime(response.currentTime);
                setProgress(response.progress);
              }
            });
          } else {
            setHasVideo(false);
            setVideoUrl('');
          }
        });
      } else {
        mockProgress = (mockProgress + 1) % 100;
        mockTime += 1;
        const minutes = Math.floor(mockTime / 60);
        const seconds = mockTime % 60;
        setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        setProgress(mockProgress);
        setHasVideo(true);
        setVideoUrl('https://www.youtube.com/watch?v=B8Ihv3xsWYs');
      }
    };

    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="progress-container">
      {hasVideo ? (
        <>
          <div className="controls-container">
            <button 
              className="control-button" 
              onClick={handleSeekBackward}
              disabled={!hasVideo}
            >
              <FontAwesomeIcon icon={faBackward} />
            </button>
            <button 
              className="control-button" 
              onClick={handlePlayPause}
              disabled={!hasVideo}
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>
            <button 
              className="control-button" 
              onClick={handleSeekForward}
              disabled={!hasVideo}
            >
              <FontAwesomeIcon icon={faForward} />
            </button>
            <div className="time-display">{currentTime}</div>
          </div>
          <div className="url-container">
            <span className="url-text">URL: {videoUrl}</span>
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        </>
      ) : (
        <div className="url-container">
          <span className="url-text">No video detected</span>
          <div className="progress-bar" style={{ width: '0%' }}></div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;