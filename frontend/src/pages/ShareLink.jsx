import React from 'react';
import { useParams } from 'react-router-dom';

export default function ShareLink() {
  const { id } = useParams();
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">共有リンク画面</h2>
      <p>リンクID: {id || "新規"}</p>
      <ul className="list-disc pl-6">
        <li>日程の追加</li>
        <li>編集・削除</li>
        <li>一覧表示</li>
      </ul>
    </div>
  );
}
