import {StrictMode, ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { RequisitesPage } from './components/RequisitesPage.tsx';
import { PaymentResultPage } from './components/PaymentResultPage.tsx';
import './index.css';
import { initializeFirebaseOnStartup } from './lib/firebase/init';

// Initialize Firebase before rendering
initializeFirebaseOnStartup().catch(err => {
  console.warn('Firebase init error (app will work offline):', err);
});

const routes: Record<string, ComponentType> = {
  '/requisites': RequisitesPage,
  '/payment-result': PaymentResultPage
};
const RootComponent = routes[window.location.pathname] || App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
);
