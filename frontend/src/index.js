import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// root要素を取得
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// StrictModeでAppをラップ（開発時のチェックを強化）
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
