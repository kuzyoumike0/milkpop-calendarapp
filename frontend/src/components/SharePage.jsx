// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Input,
  Select,
  Box,
  Heading,
  VStack,
  Text,
} from "@chakra-ui/react";

const SharePage = () => {
  const { shareId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState({}); // { "2025-08-22": { name: "", answer: "○" } }

  // 初回ロード時にサーバーから共有日程を取得
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(`/api/share/${shareId}`);
        const data = await res.json();
        setSchedules(data.schedules || []);
      } catch (err) {
        console.error("❌ 共有日程取得失敗:", err);
      }
    };
    fetchSchedules();
  }, [shareId]);

  // 入力変更処理
  const handleChange = (date, field, value) => {
    setResponses((prev) => ({
      ...prev,
      [date]: { ...prev[date], [field]: value },
    }));
  };

  // 保存処理
  const handleSave = async () => {
    const payload = Object.entries(responses).map(([date, info]) => ({
      date,
      name: info.name || "",
      answer: info.answer || "未回答",
    }));

    try {
      const res = await fetch(`/api/share/${shareId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: payload }),
      });

      if (!res.ok) throw new Error("保存失敗");
      alert("✅ 回答を保存しました！");
    } catch (err) {
      console.error(err);
      alert("❌ サーバー保存に失敗しました");
    }
  };

  return (
    <Box className="page-container">
      <Heading size="lg" textAlign="center" mb={6}>
        共有日程 - 回答ページ
      </Heading>

      <VStack spacing={6} align="stretch">
        {schedules.length === 0 && <Text>日程がありません</Text>}

        {schedules.map((s) => (
          <Box
            key={s.date}
            className="schedule-item"
            p={4}
            borderWidth="1px"
            borderRadius="lg"
          >
            <Text fontWeight="bold" mb={2}>
              📅 {s.date}（{s.time || "未設定"}）
            </Text>
            <Input
              placeholder="あなたの名前"
              mb={2}
              value={responses[s.date]?.name || ""}
              onChange={(e) => handleChange(s.date, "name", e.target.value)}
            />
            <Select
              placeholder="参加可否を選択"
              value={responses[s.date]?.answer || ""}
              onChange={(e) => handleChange(s.date, "answer", e.target.value)}
            >
              <option value="○">○ 参加可能</option>
              <option value="✖">✖ 不可</option>
            </Select>
          </Box>
        ))}
      </VStack>

      {schedules.length > 0 && (
        <Button
          colorScheme="blue"
          mt={6}
          width="100%"
          onClick={handleSave}
        >
          保存する
        </Button>
      )}
    </Box>
  );
};

export default SharePage;
