import React, { useState } from 'react';
import './Menu.css';

const Menu = ({ searches = [], logout }) => {
  const [apiKey, setApiKey] = useState('');

  const handleApiKeySubmit = () => {
    // Handle API key submission here
    console.log('API Key submitted:', apiKey);
  };

  const handleLogout = () => {
    // Determine the environment
    const isChromeExtension = window.location.protocol === 'chrome-extension:';
    const returnToUrl = isChromeExtension
      ? `chrome-extension://${chrome.runtime.id}/logout` // For Chrome Extension
      : `${window.location.origin}`; // For web app

    // Trigger the logout with the correct return URL
    logout({ returnTo: returnToUrl });
  };

  return (
    <div className="menu" onClick={(e) => e.stopPropagation()}>
      <div className="menu-header"><img src="https://hackville.s3.us-east-1.amazonaws.com/hacklogo.png" alt="App Logo" className="menuLogo" /><h3>Xccel</h3></div>

      <div className="api-key-section">
        <label className="api-key-label">OPEN AI KEY</label>
        <div className="api-key-input-container">
          <input
            type="password"
            className="api-key-input"
            placeholder="****************"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button className="api-key-enter" onClick={handleApiKeySubmit}>
            Save
          </button>
        </div>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};

export default Menu;
