import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/app/App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register();