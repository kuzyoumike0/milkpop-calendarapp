import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/schedule/${linkid}`);
      setSchedule(res.data.schedules[0]);
      setResponses(res.data.responses);
    } catch (err) {
      console.error("取得失敗:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnswerChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.post(`/api/share/${linkid}/response`, {
        username,
        answers,
      });
      fetchData(); // 即反映
    } catch (err) {
      console.error("保存失敗:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* バナー */}
      <header className="bg-[#004CA0] text-white text-center py-4 text-2xl font-bold">
        MilkPOP Calendar
      </header>

      <main className="flex flex-col items-center flex-grow py-10 px-4">
        <h2 className="text-2xl font-bold mb-6">共有スケジュール</h2>

        {schedule ? (
          <div className="mb-8 p-4 bg-[#004CA0]/50 rounded-lg w-full max-w-2xl">
            <p className="font-bold text-lg">{schedule.title}</p>
            <p className="text-sm mt-2">時間帯: {schedule.timeslot}</p>
          </div>
        ) : (
          <p>読み込み中...</p>
        )}

        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-6 p-2 rounded text-black w-80"
        />

        {/* 予定一覧に対して〇✖選択 */}
        {schedule && (
          <div className="w-full m
