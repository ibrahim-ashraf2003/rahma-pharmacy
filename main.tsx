import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CartProvider } from './context/CartContext.tsx';

// Secondary safety check for window.fetch
if (typeof window !== 'undefined' && !Object.getOwnPropertyDescriptor(window, 'fetch')?.set) {
  try {
    const originalFetch = window.fetch;
    Object.defineProperty(window, 'fetch', {
      get: () => originalFetch,
      set: () => { /* Prevent override */ },
      configurable: true
    });
  } catch (e) {
    // Already handled or not possible
  }
}

import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
);
