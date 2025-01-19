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

    // Simulate GPT response
    setIsStreaming(true);
    const gptResponse = "This is a dummy GPT response that will be replaced with actual GPT responses later. For now, I'm just demonstrating the different message types and styling.";
    let streamedText = '';
    
    for (let i = 0; i < gptResponse.length; i++) {
      streamedText += gptResponse[i];
      setCurrentStreamingText(streamedText);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20));
    }
    
    setIsStreaming(false);
    setResults(prev => [...prev, { 
      text: gptResponse,
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