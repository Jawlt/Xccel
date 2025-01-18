import React, { useState } from 'react';
import './Menu.css';

const Menu = ({ searches = [], onClose }) => {
  const [apiKey, setApiKey] = useState('');

  const handleApiKeySubmit = () => {
    // Handle API key submission here
    console.log('API Key submitted:', apiKey);
  };

  return (
    <div className="menu" onClick={(e) => e.stopPropagation()}>
      <div className="menu-header">Searches</div>
      
      <div className="search-list">
        {searches.map((search, index) => (
          <div key={index} className="search-item">
            {search}
          </div>
        ))}
      </div>

      <div className="api-key-section">
        <label className="api-key-label">OPEN AI KEY</label>
        <div className="api-key-input-container">
          <input
            type="password"
            className="api-key-input"
            placeholder="Enter your OpenAI API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button className="api-key-enter" onClick={handleApiKeySubmit}>
            Save
          </button>
        </div>
      </div>

      <button className="logout-button" onClick={onClose}>
        LOG OUT
      </button>
    </div>
  );
};

export default Menu;