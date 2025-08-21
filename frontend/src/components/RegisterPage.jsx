import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Heading,
  Input,
  RadioGroup,
  Stack,
  Radio,
  Button,
  VStack,
  Text,
  HStack,
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";

// ✅ FullCalendar v6 以降は main.css → index.css
import "@fullcalendar/common/index.css";
import "@fullcalendar/daygrid/index.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [events, setEvents] = useState([]);
  const [selectionMode, setSelectionMode] = useState("range");
  const [timeOption, setTimeOption] = useState("allday");
  const [shareUrl, setShareUrl] = useState("");
  const calendarRef = useRef(null);

  const handleDateSelect = (selectInfo) => {
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    const newEvent = {
      id: uuidv4(),
      title: title || "予定",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: true,
    };

    setEvents([...events, newEvent]);
  };

  const handleGenerateLink = () => {
    const fakeLink = `${window.location.origin}/share/${uuidv4()}`;
    setShareUrl(fakeLink);
  };

  return (
    <Box maxW="900px" mx="auto" mt={10} p={6} bg="white" borderRadius="lg" boxShadow="xl">
      <Heading mb={6} textAlign="center" color="brand.blue">
        📅 日程登録ページ
      </Heading>

      {/* タイトル入力 */}
      <VStack spacing={4} align="stretch" mb={6}>
        <Box>
          <Text fontWeight="bold">タイトル</Text>
          <Input
            placeholder="イベント名を入力してください"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            bg="gray.50"
          />
        </Box>

        {/* 日程選択モード */}
        <Box>
          <Text fontWeight="bold">日程選択方法</Text>
          <RadioGroup onChange={setSelectionMode} value={selectionMode}>
            <Stack direction="row">
              <Radio value="range">範囲選択</Radio>
              <Radio value="multiple">複数選択</Radio>
            </Stack>
          </RadioGroup>
        </Box>

        {/* 時間帯選択 */}
        <Box>
          <Text fontWeight="bold">時間帯</Text>
          <RadioGroup onChange={setTimeOption} value={timeOption}>
            <Stack direction="row" wrap="wrap">
              <Radio value="allday">終日</Radio>
              <Radio value="day">昼</Radio>
              <Radio value="night">夜</Radio>
              <Radio value="custom">時間指定</Radio>
            </Stack>
          </RadioGroup>
        </Box>
      </VStack>

      {/* カレンダー */}
      <Box border="1px solid #e2e8f0" borderRadius="md" p={4} bg="gray.50">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          selectMirror={true}
          select={handleDateSelect}
          events={events}
          height="auto"
          dayMaxEvents={true}
        />
      </Box>

      {/* 共有リンク生成 */}
      <HStack mt={6} justify="center">
        <Button
          colorScheme="pink"
          size="lg"
          borderRadius="full"
          onClick={handleGenerateLink}
        >
          共有リンクを発行
        </Button>
      </HStack>

      {/* 共有URL表示 */}
      {shareUrl && (
        <Box mt={4} textAlign="center">
          <Text fontWeight="bold" color="brand.blue">
            🔗 共有リンク:
          </Text>
          <Text color="blue.500">{shareUrl}</Text>
        </Box>
      )}
    </Box>
  );
};

export default RegisterPage;
