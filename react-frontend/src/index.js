import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from "@auth0/auth0-react";

// Get the Auth0 domain and client ID from environment variables
const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

// Determine the redirect URI based on the environment
const isChromeExtension = window.location.protocol === "chrome-extension:";
const redirectUri = isChromeExtension
  ? `chrome-extension://${chrome.runtime.id}` // For Chrome extension
  : window.location.origin; // For web app
const logoutUri = redirectUri + "/index.html";

// Initialize the root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
    >
      <App redirectUri={redirectUri} logoutUri={logoutUri} />
    </Auth0Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
