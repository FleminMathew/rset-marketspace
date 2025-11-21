import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx'; // Corrected from './App' and './App.jsx'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Note: The imports for index.css and reportWebVitals have been removed.