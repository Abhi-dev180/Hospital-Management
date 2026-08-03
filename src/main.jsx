// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )


import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// ─── Hide initial loader ───────────────────────────
const hideLoader = () => {
  const el = document.getElementById('initial-loader');
  if (el) {
    el.classList.add('hidden');
    setTimeout(() => el.remove(), 700);
  }
};

// ─── Render React ───────────────────────────────
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

requestAnimationFrame(() => setTimeout(hideLoader, 50));

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hideLoader);
} else {
  hideLoader();
}