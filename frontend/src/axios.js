import axios from 'axios';

// Docker / ローカル共通で使えるベースURL
// ビルド時に環境変数 REACT_APP_API_URL があればそれを使用
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '', // '' の場合は同一ドメインでアクセス
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
