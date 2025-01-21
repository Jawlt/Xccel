import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import ProgressBar from './components/ProgressBar';
import PromptBar from './components/PromptBar';
import UserProfile from './components/UserProfile';
import ResultsArea from './components/ResultsArea';
import './App.css';

function App({redirectUri, logoutUri}) {
  const [results, setResults] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');
  const [timestamps, setTimestamps] = useState([]);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);

  const extractTimestamps = (text) => {
    console.log("Extracting timestamps from:", text);
    const timestamps = new Set();
    
    const standardRegex = /\b(\d{1,2}:)?(\d{1,2}):(\d{2})\b/g;
    const standardMatches = text.match(standardRegex) || [];
    console.log("Standard matches:", standardMatches);
    standardMatches.forEach(match => timestamps.add(match));

    const bracketRegex = /\[(\d{1,2}):(\d{2}):(\d{2})\.?\d*\]/g;
    const bracketMatches = Array.from(text.matchAll(bracketRegex));
    console.log("Bracket matches:", bracketMatches);
    
    for (const match of bracketMatches) {
      const [_, hours, minutes, seconds] = match;
      const formattedHours = hours.padStart(2, '0');
      const formattedMinutes = minutes.padStart(2, '0');
      const formattedSeconds = seconds.padStart(2, '0');
      
      const formattedTime = formattedHours === '00' ? 
        `${parseInt(formattedMinutes)}:${formattedSeconds}` : 
        `${parseInt(formattedHours)}:${formattedMinutes}:${formattedSeconds}`;
      
      timestamps.add(formattedTime);
    }

    const result = Array.from(timestamps);
    console.log("Extracted timestamps:", result);
    return result;
  };

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
    let messageListener;
    
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      messageListener = (message, sender, sendResponse) => {
        if (message.action === "videoUpdate" && message.data.videoId) {
          const newVideoId = message.data.videoId;
          if (newVideoId !== currentVideoId) {
            setCurrentVideoId(newVideoId);
          }
        }
      };
      
      chrome.runtime.onMessage.addListener(messageListener);
    }

    return () => {
      if (messageListener) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    };
  }, [currentVideoId]);

  useEffect(() => {
    const processTranscript = async () => {
      if (!currentVideoId) return;
      
      setIsProcessingTranscript(true);
      try {
        const response = await axios.get(`http://localhost:8000/public/transcript/${currentVideoId}`);
        if (response.data.status === "completed") {
          console.log("Transcript processing completed");
        }
      } catch (error) {
        console.error("Error processing transcript:", error);
      } finally {
        setIsProcessingTranscript(false);
      }
    };

    processTranscript();
  }, [currentVideoId]);

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
            const data = line.slice(5).trim();
            
            // Handle the [DONE] message separately
            if (data === '[DONE]') {
              setIsStreaming(false);
              console.log("Full response before timestamp extraction:", fullResponse);
              const newTimestamps = extractTimestamps(fullResponse);
              console.log("Setting new timestamps:", newTimestamps);
              setTimestamps(prev => {
                const combined = [...new Set([...prev, ...newTimestamps])];
                console.log("Combined timestamps:", combined);
                return combined;
              });
              
              setResults(prev => [...prev, { 
                text: fullResponse,
                type: 'gpt'
              }]);
              setCurrentStreamingText('');
              break;
            }

            // Only try to parse JSON for actual content
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullResponse += parsed.content;
                setCurrentStreamingText(prev => prev + parsed.content);
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e, 'Raw data:', data);
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
      await loginWithPopup({
        redirectUri: redirectUri,
      });
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
      <UserProfile user={user} logout={logout} logoutUri={logoutUri}/>
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