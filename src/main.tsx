import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { RequisitesPage } from './components/RequisitesPage.tsx';
import './index.css';
import { initializeFirebaseOnStartup } from './lib/firebase/init';

// Initialize Firebase before rendering
initializeFirebaseOnStartup().catch(err => {
  console.warn('Firebase init error (app will work offline):', err);
});

const RootComponent = window.location.pathname === '/requisites' ? RequisitesPage : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
);
