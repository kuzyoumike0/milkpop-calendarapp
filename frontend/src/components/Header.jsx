import React from "react";
import { useHistory } from "react-router-dom";

export default function Header() {
  const history = useHistory();

  return (
    <header className="w-full bg-[#004CA0] text-white p-4 flex justify-between items-center shadow-md">
      <h1
        className="text-2xl font-extrabold cursor-pointer text-[#FDB9C8]"
        onClick={() => history.push("/")}
      >
        MilkPOP Calendar
      </h1>

      <nav className="flex gap-6">
        <button
          onClick={() => history.push("/link")}
          className="hover:text-[#FDB9C8]"
        >
          日程登録
        </button>
        <button
          onClick={() => history.push("/personal")}
          className="hover:text-[#FDB9C8]"
        >
          個人スケジュール
        </button>
      </nav>
    </header>
  );
}
