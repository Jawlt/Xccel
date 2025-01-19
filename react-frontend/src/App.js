import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import ProgressBar from './components/ProgressBar';
import PromptBar from './components/PromptBar';
import UserProfile from './components/UserProfile';
import ResultsArea from './components/ResultsArea';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');
  const [timestamps, setTimestamps] = useState([]);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);

  const extractTimestamps = (text) => {
    const timestamps = new Set();
    
    // Match HH:MM:SS or MM:SS format
    const standardRegex = /\b(\d{1,2}:)?(\d{1,2}):(\d{2})\b/g;
    const standardMatches = text.match(standardRegex) || [];
    standardMatches.forEach(match => timestamps.add(match));

    // Match [H:MM:SS.XXXXXX] format
    const bracketRegex = /\[(\d{1,2}):(\d{2}):(\d{2})\.?\d*\]/g;
    const bracketMatches = text.matchAll(bracketRegex);
    for (const match of bracketMatches) {
      const [_, hours, minutes, seconds] = match;
      // Ensure proper formatting with leading zeros for single-digit values
      const formattedHours = hours.padStart(2, '0');
      const formattedMinutes = minutes.padStart(2, '0');
      const formattedSeconds = seconds.padStart(2, '0');
      
      // If hours is '00', omit it from the timestamp
      const formattedTime = formattedHours === '00' ? 
        `${parseInt(formattedMinutes)}:${formattedSeconds}` : 
        `${parseInt(formattedHours)}:${formattedMinutes}:${formattedSeconds}`;
      
      timestamps.add(formattedTime);
    }

    return Array.from(timestamps);
  };

  // Rest of the component remains the same...
  const {
    loginWithPopup,
    logout,
    isAuthenticated,
    user,
    getAccessTokenSilently,
    isLoading,
  } = useAuth0();

  useEffect(() => {
    const updateUserInBackend = async () => {
      if (isAuthenticated && user) {
        try {
          await axios.post(
            process.env.REACT_APP_AUTH0_API_IDENTIFIER + "/public/add_user",
            {
              id: user.sub,
              name: user.name,
              email: user.email,
              picture: user.picture,
            }
          );
          console.log("User data successfully updated in backend.");
        } catch (error) {
          console.error("Error updating user in backend:", error);
        }
      }
    };

    updateUserInBackend();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.action === "videoUpdate" && message.data.videoId) {
          const videoId = message.data.videoId;
          setCurrentVideoId(videoId);
          
          if (videoId) {
            setIsProcessingTranscript(true);
            try {
              const response = await axios.get(`http://localhost:8000/public/transcript/${videoId}`);
              if (response.data.status === "completed") {
                console.log("Transcript processing completed");
              }
            } catch (error) {
              console.error("Error processing transcript:", error);
            } finally {
              setIsProcessingTranscript(false);
            }
          }
        }
      });

    }
  }, []);

  const handlePromptSubmit = async (userPrompt) => {
    setResults(prev => [...prev, { 
      text: `**Search: ${userPrompt}**`,
      type: 'user'
    }]);

    setIsStreaming(true);
    setCurrentStreamingText('');


    try {
      const contextResponse = await axios.post(
        'http://localhost:8000/public/chat',
        { message: userPrompt }
      );

      const context = contextResponse.data.context;
      console.log("Retrieved context:", context);

      const response = await fetch('http://localhost:8000/public/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userPrompt,
          context: context
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5);
            if (data === '[DONE]') {
              setIsStreaming(false);
              // Extract timestamps from the complete response
              const newTimestamps = extractTimestamps(fullResponse);
              setTimestamps(prev => [...new Set([...prev, ...newTimestamps])]);
              
              setResults(prev => [...prev, { 
                text: fullResponse,
                type: 'gpt'
              }]);
              setCurrentStreamingText('');
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullResponse += parsed.content;
                setCurrentStreamingText(prev => prev + parsed.content);
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing prompt:", error);
      setResults(prev => [...prev, { 
        text: "Sorry, I encountered an error processing your request. Please try again.",
        type: 'gpt'
      }]);
      setIsStreaming(false);
      setCurrentStreamingText('');
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithPopup();
      console.log("Logged in user:", user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="LoginPopup">
        <div className="LoginModal">
          <img src="https://hackville.s3.us-east-1.amazonaws.com/hacklogo.png" alt="App Logo" className="LoginLogo" />
          <h2>Welcome to Xccel</h2>
          <p>Please log in to continue.</p>
          <button onClick={handleLogin}>Log In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <ProgressBar timestamps={timestamps} />
      <UserProfile user={user} logout={logout}/>
      <ResultsArea 
        results={results} 
        isStreaming={isStreaming}
        currentStreamingText={currentStreamingText}
        user={user}
        isProcessingTranscript={isProcessingTranscript}
      />
      <PromptBar onSubmit={handlePromptSubmit} />
    </div>
  );
}

export default App;