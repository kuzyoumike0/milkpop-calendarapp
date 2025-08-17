import React from 'react';
import { Link } from 'react-router-dom';

export default function TopPage() {
  return (
    <div className="page">
      <h2>トップページ</h2>
      <p><Link to="/shared">共有スケジュール作成</Link></p>
      <p><Link to="/personal">個人スケジュール作成</Link></p>
    </div>
  );
}
