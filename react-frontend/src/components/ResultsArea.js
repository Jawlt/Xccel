import React from 'react';
import './ResultsArea.css';

const ResultsArea = ({ results, isStreaming, currentStreamingText, user }) => {
  const formatText = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className="results-area">
      {results.map((result, index) => (
        <div key={index} className="result-item assistant">
          <div className="avatar">
            {user?.picture ? (
              <img src={user.picture} alt="User" className="avatar-image" />
            ) : (
              'A'
            )}
          </div>
          <div className="message-content" 
            dangerouslySetInnerHTML={{ __html: formatText(result.text) }}>
          </div>
        </div>
      ))}
      {isStreaming && (
        <div className="result-item assistant streaming">
          <div className="avatar">
            {user?.picture ? (
              <img src={user.picture} alt="User" className="avatar-image" />
            ) : (
              'A'
            )}
          </div>
          <div className="message-content"
            dangerouslySetInnerHTML={{ __html: formatText(currentStreamingText) }}>
          </div>
          <span className="cursor"></span>
        </div>
      )}
    </div>
  );
};

export default ResultsArea;