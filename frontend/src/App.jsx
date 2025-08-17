import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div className="p-6">
      <h1 className="text-3xl text-brandPink font-bold mb-4">カレンダーアプリ</h1>
      <div className="space-x-4">
        <Link to="/personal" className="bg-brandBlue text-white px-4 py-2 rounded">個人スケジュール</Link>
        <Link to="/shared" className="bg-brandPink text-black px-4 py-2 rounded">共有スケジュール</Link>
      </div>
    </div>
  );
}

function Personal() {
  return <h2 className="p-6">ここにお洒落な個人カレンダーを表示</h2>;
}

function Shared() {
  return <h2 className="p-6">ここに共有カレンダーを表示（範囲選択＆時間選択付き）</h2>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/personal" element={<Personal />} />
        <Route path="/shared" element={<Shared />} />
      </Routes>
    </Router>
  );
}
