import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './PromptBar.css';

const PromptBar = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  const handleMicClick = () => {
    // Implement microphone functionality
    console.log('Microphone clicked');
  };

  return (
    <form className="prompt-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type In Here"
        className="prompt-input"
      />
      <button type="button" className="mic-button" onClick={handleMicClick}>
        <FontAwesomeIcon icon={faMicrophone} />
      </button>
      <button type="submit" className="send-button">
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </form>
  );
};

export default PromptBar;