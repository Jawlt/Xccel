import React from 'react';
import './ResultsArea.css';

const ResultsArea = ({ results, isStreaming, currentStreamingText }) => {
  return (
    <div className="results-area">
      {results.map((result, index) => (
        <div key={index} className="result-item assistant">
          <div className="avatar">A</div>
          <div className="message-content">
            {result.text}
          </div>
        </div>
      ))}
      {isStreaming && (
        <div className="result-item assistant streaming">
          <div className="avatar">A</div>
          <div className="message-content">
            {currentStreamingText}
            <span className="cursor"></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsArea;