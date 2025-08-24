import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="page-container">
      <div className="card" style={{ background: "red", minHeight: "200px" }}>
        <h1>デバッグ：TopPage表示テスト</h1>
        <p>ここが表示されれば TopPage はOK</p>
      </div>
    </div>
  );
};

export default TopPage;
