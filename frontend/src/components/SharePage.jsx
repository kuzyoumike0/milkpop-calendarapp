import React from "react";
import { useParams } from "react-router-dom";

function SharePage() {
  const { linkid } = useParams();

  return (
    <div className="text-center mt-20">
      <h2 className="text-2xl font-bold text-[#FDB9C8] mb-4">共有ページ</h2>
      <p className="text-gray-300">リンクID: {linkid}</p>
    </div>
  );
}

export default SharePage;
