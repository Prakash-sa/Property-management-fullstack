import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { store } from './app/store';
import { attachInterceptors } from './services/api';

// Load mocks first (if enabled)
(async () => {
  if (import.meta.env.VITE_USE_MOCKS === '1') {
    const { setupMocks } = await import('./mocks/mockServer');
    await setupMocks();
  }
  attachInterceptors(store);
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
})();
