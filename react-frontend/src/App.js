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
  const [searches] = useState(['3:21', '3:21', '3:21']);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');
  const [timestamps, setTimestamps] = useState([]);
  const [currentVideoId, setCurrentVideoId] = useState(null);

  const extractTimestamp = (text) => {
    const timestampRegex = /\b(\d{1,2}):(\d{2})\b/;
    const match = text.match(timestampRegex);
    return match ? match[0] : null;
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

  // Listen for video updates from content script
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "videoUpdate" && message.data.videoId) {
          setCurrentVideoId(message.data.videoId);
        }
      });
    }
  }, []);

  const fetchTranscript = async (videoId) => {
    try {
      console.log('Fetching transcript for video:', videoId); // Debug log
      const response = await axios.get(
        `http://localhost:8000/public/transcript/${videoId}`  // Use explicit localhost URL
      );
      console.log('Transcript response:', response.data); // Debug log
      return response.data.transcript;
    } catch (error) {
      console.error("Error fetching transcript:", error);
      return `Error fetching transcript: ${error.message}. Please try again.`;
    }
  };
  

  const simulateStreamingResponse = async (user_prompt) => {
    const timestamp = extractTimestamp(user_prompt);
    if (timestamp) {
      setTimestamps(prev => [...prev, timestamp]);
    }

    // Add user message
    setResults(prev => [...prev, { 
      text: `**Search: ${user_prompt}**`,
      type: 'user'
    }]);

    // Get transcript if video ID is available
    setIsStreaming(true);
    let response;
    if (currentVideoId) {
      response = await fetchTranscript(currentVideoId);
    } else {
      response = "No YouTube video detected. Please make sure you're on a YouTube video page.";
    }

    let streamedText = '';
    for (let i = 0; i < response.length; i++) {
      streamedText += response[i];
      setCurrentStreamingText(streamedText);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20));
    }
    
    setIsStreaming(false);
    setResults(prev => [...prev, { 
      text: response,
      type: 'gpt'
    }]);
    setCurrentStreamingText('');
  };

  const handlePromptSubmit = (user_prompt) => {
    simulateStreamingResponse(user_prompt);
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
          <h2>Welcome to the App</h2>
          <p>Please log in to continue.</p>
          <button onClick={handleLogin}>Log In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <ProgressBar timestamps={timestamps} />
      <UserProfile user={user} searches={searches} logout={logout}/>
      <ResultsArea 
        results={results} 
        isStreaming={isStreaming}
        currentStreamingText={currentStreamingText}
        user={user}
      />
      <PromptBar onSubmit={handlePromptSubmit} />
    </div>
  );
}

export default App;