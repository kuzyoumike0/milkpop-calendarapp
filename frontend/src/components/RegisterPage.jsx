// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  HStack,
  RadioGroup,
  Radio,
  Text,
} from "@chakra-ui/react";
import {
  Calendar,
  dateFnsLocalizer
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ja } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

// date-fns をローカライズ
const locales = { ja };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

function RegisterPage() {
  const [title, setTitle] = useState("");
  const [events, setEvents] = useState([]);
  const [timeOption, setTimeOption] = useState("allday");
  const [shareUrl, setShareUrl] = useState("");

  // イベント追加
  const handleSelectSlot = ({ start, end }) => {
    const newEvent = {
      title: title || "未設定",
      start,
      end,
      allDay: timeOption === "allday",
    };
    setEvents([...events, newEvent]);
  };

  // 共有リンク生成
  const handleGenerateLink = () => {
    const url = `${window.location.origin}/share?id=${Date.now()}`;
    setShareUrl(url);
  };

  return (
    <Box p={6}>
      <Heading mb={4} textAlign="center" bgGradient="linear(to-r, pink.400, blue.500)" bgClip="text">
        📅 日程登録ページ
      </Heading>

      <VStack spacing={6}>
        {/* タイトル入力 */}
        <Box w="100%">
          <Text fontWeight="bold">タイトル</Text>
          <Input
            placeholder="イベントタイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Box>

        {/* 時間帯選択 */}
        <Box w="100%">
          <Text fontWeight="bold">時間帯</Text>
          <RadioGroup value={timeOption} onChange={setTimeOption}>
            <HStack spacing={6}>
              <Radio value="allday">終日</Radio>
              <Radio value="day">昼</Radio>
              <Radio value="night">夜</Radio>
              <Radio value="custom">開始・終了を設定</Radio>
            </HStack>
          </RadioGroup>
        </Box>

        {/* カレンダー */}
        <Box w="100%" h="600px" borderRadius="lg" overflow="hidden" boxShadow="md">
          <Calendar
            selectable
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%", background: "white", borderRadius: "8px" }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={(event) => alert(`選択: ${event.title}`)}
            messages={{
              next: "次へ",
              previous: "前へ",
              today: "今日",
              month: "月",
              week: "週",
              day: "日",
            }}
          />
        </Box>

        {/* 共有リンク生成 */}
        <Button
          onClick={handleGenerateLink}
          colorScheme="blue"
          borderRadius="full"
          bgGradient="linear(to-r, pink.400, blue.500)"
          color="white"
          _hover={{ opacity: 0.8 }}
        >
          共有リンクを発行
        </Button>

        {shareUrl && (
          <Box>
            <Text fontWeight="bold">共有リンク:</Text>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" style={{ color: "blue" }}>
              {shareUrl}
            </a>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default RegisterPage;
