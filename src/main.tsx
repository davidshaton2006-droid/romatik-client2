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

const BUILD_MARKER = 'cf-cache-bust-2';
const RootComponent = window.location.pathname === '/requisites' ? RequisitesPage : App;
if (window.location.search.includes('__build')) {
  console.log(BUILD_MARKER);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
);
