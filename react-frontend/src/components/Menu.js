import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Menu.css';

const Menu = ({ user, logout, logoutUri }) => {
  const [apiKey, setApiKey] = useState('');
  const [placeholderKey, setPlaceholderKey] = useState('');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch the existing API key when component mounts
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await axios.post(`${BACKEND_URL}/public/getOpenAiKey`, {
          userId: user.id,
        });
        console.log(response.data.apiKey);
        if (response.data && response.data.apiKey) {
          setPlaceholderKey(response.data.apiKey);
        } else {
          console.error('No API key found');
        }
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    };

    fetchApiKey();
  }, [user.id]);

  // Handle API key submission
  const handleApiKeySubmit = async (newApiKey) => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_AUTH0_API_IDENTIFIER + "/updateOpenAiKey",
        {
          userId: user.sub,
          apiKey: newApiKey,
        }
      );
      console.log("API Key update response:", response.data);
    } catch (error) {
      console.error("Error updating API key:", error.response?.data || error.message);
    }
  };

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: logoutUri,
      }
    });
  };

  return (
    <div className="menu" onClick={(e) => e.stopPropagation()}>
      <div className="menu-header">
        <img src="https://hackville.s3.us-east-1.amazonaws.com/hacklogo.png" alt="App Logo" className="menuLogo" />
        <h3>Xccel</h3>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};

export default Menu;
