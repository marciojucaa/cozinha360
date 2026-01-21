import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 🔥 REGISTRO DO SERVICE WORKER (OBRIGATÓRIO PARA PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {
        console.log('✅ Service Worker registrado');
      })
      .catch((error) => {
        console.error('❌ Erro ao registrar SW:', error);
      });
  });
}
