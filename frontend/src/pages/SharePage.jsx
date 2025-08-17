import React, { useState } from 'react';

export default function SharePage() {
  const [link, setLink] = useState('https://example.com/share/abc123');
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔗 共有設定</h1>
      <p>以下のリンクを共有してください:</p>
      <input type="text" value={link} readOnly className="p-2 border rounded w-full mt-2" />
    </div>
  );
}
