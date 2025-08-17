import React from "react";
import { useParams } from "react-router-dom";

export default function SharedLink() {
  const { id } = useParams();
  return (
    <div>
      <h2 className="text-xl">共有リンクページ</h2>
      <p>リンクID: {id}</p>
    </div>
  );
}
