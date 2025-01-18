import React, { useState, useEffect } from 'react';
import ProgressBar from './components/ProgressBar';
import PromptBar from './components/PromptBar';
import UserProfile from './components/UserProfile';
import ResultsArea from './components/ResultsArea';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [startTime] = useState(Date.now());
  const [endTime] = useState(Date.now() + 60000); // 60 seconds duration
  const [searches] = useState(['3:21', '3:21', '3:21']); // Example searches
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');

  const simulateStreamingResponse = async (prompt) => {
    const response = `This is a sample response to: ${prompt}`;
    setIsStreaming(true);
    let streamedText = '';
    
    for (let i = 0; i < response.length; i++) {
      streamedText += response[i];
      setCurrentStreamingText(streamedText);
      // Simulate random typing speed between 20-50ms
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20));
    }
    
    setIsStreaming(false);
    setResults([...results, { text: streamedText, completed: true }]);
    setCurrentStreamingText('');
  };

  const handlePromptSubmit = (prompt) => {
    simulateStreamingResponse(prompt);
  };

  return (
    <div className="App">
      <ProgressBar startTime={startTime} endTime={endTime} />
      <UserProfile user={{ name: 'User' }} searches={searches} />
      <ResultsArea 
        results={results} 
        isStreaming={isStreaming}
        currentStreamingText={currentStreamingText}
      />
      <PromptBar onSubmit={handlePromptSubmit} />
    </div>
  );
}

export default App;