import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.jsx';
import './styles/index.css';
import './styles/theme.css';
import { rememberCampaignAttribution } from './analytics/events.js';

rememberCampaignAttribution();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
