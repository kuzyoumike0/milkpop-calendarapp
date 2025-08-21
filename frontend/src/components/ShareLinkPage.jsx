// frontend/src/components/ShareLinkPage.jsx
import React from "react";
import { useParams } from "react-router-dom";

function ShareLinkPage() {
  const { linkid } = useParams();

  return (
    <div className="text-center mt-20">
      <h2 className="text-2xl font-bold text-[#004CA0] mb-4">共有リンクページ</h2>
      <p className="text-gray-300">リンクID: {linkid}</p>
    </div>
  );
}

export default ShareLinkPage;
