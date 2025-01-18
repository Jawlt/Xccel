import React, { useState, useEffect } from 'react';
import './ProgressBar.css';

const ProgressBar = ({ startTime, endTime }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const now = Date.now();
      const newProgress = Math.min(((now - startTime) / (endTime - startTime)) * 100, 100);
      setProgress(newProgress);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [startTime, endTime]);

  return (
    <div className="progress-container">
      <div className="url-container">
        <span className="url-text">URL:https://www.youtube.com/watch?v=B8Ihv3xsWYs</span>
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;