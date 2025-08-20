import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#004CA0] text-white p-4 flex justify-between items-center shadow-md">
      <h1
        className="text-2xl font-extrabold cursor-pointer text-[#FDB9C8]"
        onClick={() => navigate("/")}
      >
        MilkPOP Calendar
      </h1>

      <nav className="flex gap-6">
        <button
          onClick={() => navigate("/link")}
          className="hover:text-[#FDB9C8]"
        >
          日程登録
        </button>
        <button
          onClick={() => navigate("/personal")}
          className="hover:text-[#FDB9C8]"
        >
          個人スケジュール
        </button>
      </nav>
    </header>
  );
}
