import React, { useState } from 'react';
import ProgressBar from './components/ProgressBar';
import PromptBar from './components/PromptBar';
import UserProfile from './components/UserProfile';
import ResultsArea from './components/ResultsArea';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [searches] = useState(['3:21', '3:21', '3:21']);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');
  const [timestamps, setTimestamps] = useState([]);

  const extractTimestamp = (text) => {
    const timestampRegex = /\b(\d{1,2}):(\d{2})\b/;
    const match = text.match(timestampRegex);
    return match ? match[0] : null;
  };

  const simulateStreamingResponse = async (prompt) => {
    const timestamp = extractTimestamp(prompt);
    if (timestamp) {
      setTimestamps(prev => [...prev, timestamp]);
    }

    const response = `This is a sample response to: ${prompt}`;
    setIsStreaming(true);
    let streamedText = '';
    
    for (let i = 0; i < response.length; i++) {
      streamedText += response[i];
      setCurrentStreamingText(streamedText);
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
      <ProgressBar timestamps={timestamps} />
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