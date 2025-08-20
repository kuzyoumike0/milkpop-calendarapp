import { useState } from "react";

export default function SharePage() {
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});

  const handleSave = () => {
    console.log("保存:", username, answers);
  };

  return (
    <div>
      <div className="header">MilkPOP Calendar</div>
      <div className="flex justify-center items-center min-h-screen">
        <div className="card w-11/12 md:w-3/4">
          <h2 className="text-xl font-bold mb-4">共有スケジュール</h2>
          <input
            type="text"
            placeholder="あなたの名前"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-4 rounded-lg border"
          />
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2">日付</th>
                <th className="p-2">回答</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">2025-08-21</td>
                <td className="p-2">
                  <select
                    onChange={(e) =>
                      setAnswers({ ...answers, "2025-08-21": e.target.value })
                    }
                    className="border rounded p-1"
                  >
                    <option value="">選択</option>
                    <option value="◯">◯</option>
                    <option value="✕">✕</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <button onClick={handleSave} className="btn-main mt-4">
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}
