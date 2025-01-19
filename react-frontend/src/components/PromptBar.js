import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './PromptBar.css';

const PromptBar = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopRecognition();
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or a compatible browser.');
      return;
    }

    try {
      const recognition = new window.webkitSpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPrompt((prevPrompt) => prevPrompt + ' ' + transcript);
        stopRecognition();
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        switch (event.error) {
          case 'not-allowed':
            alert('Please allow microphone access to use speech recognition.');
            break;
          case 'aborted':
            console.log('Speech recognition aborted.');
            break;
          default:
            alert('Speech recognition error. Please try again.');
        }
        stopRecognition();
      };

      recognition.onend = () => {
        stopRecognition();
      };

      recognition.start();
    } catch (error) {
      console.error('Speech recognition setup error:', error);
      alert('Failed to start speech recognition. Please try again.');
      stopRecognition();
    }
  };

  return (
    <form className="prompt-bar" onSubmit={handleSubmit}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type in here"
        className="prompt-input"
      />
      <button
        type="button"
        className={`mic-button ${isListening ? 'listening' : ''}`}
        onClick={handleMicClick}
        title={isListening ? 'Stop listening' : 'Start listening'}
      >
        <FontAwesomeIcon icon={isListening ? faSpinner : faMicrophone} size="2x" spin={isListening} />
      </button>
      <button type="submit" className="send-button" title="Send message">
        <FontAwesomeIcon icon={faPaperPlane} size="2x" />
      </button>
    </form>
  );
};

export default PromptBar;
