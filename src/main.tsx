import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Defensive shims for the environment
if (typeof window !== 'undefined') {
  // 1. Prevent "Cannot set property fetch" errors
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    // If it's a getter-only property and we can't change it directly, 
    // we can try to define a setter that does nothing to absorb assignments.
    if (descriptor && !descriptor.set && descriptor.configurable) {
      const originalFetch = window.fetch;
      Object.defineProperty(window, 'fetch', {
        configurable: true,
        enumerable: true,
        get: () => originalFetch,
        set: (v) => { 
          // Do nothing, just ignore the set to avoid TypeError
          console.debug('Blocked fetch assignment:', v);
        }
      });
    }
  } catch (e) {
    // Ignore errors in shim application
  }

  // 2. Fix "Uncaught SyntaxError: 'undefined' is not valid JSON"
  // This often happens when libraries try to parse a string value that is literally "undefined"
  const originalParse = JSON.parse;
  JSON.parse = function(text, reviver) {
    if (text === "undefined") return undefined;
    if (text === null) return null;
    return originalParse.call(JSON, text, reviver);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
