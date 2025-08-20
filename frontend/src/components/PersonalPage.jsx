import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { ja } from "date-fns/locale";
import { format } from "date-fns";
import "./CalendarStyle.css";
import Header from "./Header";  // 追加

export default function PersonalPage() {
  // ...省略（前回のコードそのまま）

  return (
    <div className="min-h-screen bg-black text-white">
      <Header /> {/* 共通バナー */}

      <div className="p-6">
        {/* ← ここから前回の入力フォーム & カレンダー */}
      </div>
    </div>
  );
}
