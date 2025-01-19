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

  const { loginWithRedirect, logout, isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  // Function to send user data to backend
  useEffect(() => {
    const updateUserInBackend = async () => {
      if (isAuthenticated && user) {
        try {
          // Send user data to the backend
          await axios.post(
            process.env.REACT_APP_AUTH0_API_IDENTIFIER + "/public/add_user",
            {
              id: user.sub,       // Auth0 user ID
              name: user.name,    // User's name
              email: user.email,  // User's email
              picture: user.picture, // User's profile picture
            }
          );

          console.log("User data successfully updated in backend.");
        } catch (error) {
          console.error("Error updating user in backend:", error);
        }
      }
    };

    updateUserInBackend();
  }, [isAuthenticated, user]); // Runs when isAuthenticated or user changes
  

  // Function to simulate streaming responses
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

  // Handle prompt submission
  const handlePromptSubmit = (prompt) => {
    simulateStreamingResponse(prompt);
  };


  if (!isAuthenticated) {
    return (
      <div className="LoginPopup">
        <div className="LoginModal">
          <h2>Welcome to the App</h2>
          <p>Please log in to continue.</p>
          <button onClick={() => loginWithRedirect()}>Log In</button>
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
      />
      <PromptBar onSubmit={handlePromptSubmit} />
    </div>
  );
}

export default App;
