import React from 'react';
import './ResultsArea.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import gptLogo from '../assets/gpt-logo.png';

const ResultsArea = ({ results, isStreaming, currentStreamingText, user, isProcessingTranscript }) => {
  const formatText = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  if (isProcessingTranscript) {
    return (
      <div className="results-area">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="loading-spinner" />
          <p className="loading-text">Processing video transcript...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-area">
      {results.map((result, index) => (
        <div key={index} className={`result-item ${result.type}`}>
          <div className="avatar">
            {result.type === 'user' ? (
              user?.picture ? (
                <img src={user.picture} alt="User" className="avatar-image" />
              ) : (
                'U'
              )
            ) : (
              <img src={gptLogo} alt="GPT" className="gpt-avatar" />
            )}
          </div>
          <div className="message-content" 
            dangerouslySetInnerHTML={{ __html: formatText(result.text) }}>
          </div>
        </div>
      ))}
      {isStreaming && (
        <div className="result-item gpt streaming">
          <div className="avatar">
            <img src={gptLogo} alt="GPT" className="gpt-avatar" />
          </div>
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