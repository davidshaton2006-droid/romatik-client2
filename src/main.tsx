import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeFirebaseOnStartup } from './lib/firebase/init';

// Initialize Firebase before rendering
initializeFirebaseOnStartup().catch(err => {
  console.warn('Firebase init error (app will work offline):', err);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
