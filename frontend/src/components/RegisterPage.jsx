// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Radio,
  RadioGroup,
  HStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { v4 as uuidv4 } from "uuid";
import { Link as RouterLink } from "react-router-dom";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectionMode, setSelectionMode] = useState("range"); // "range" or "multi"
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeOption, setTimeOption] = useState("allday");
  const [shareLink, setShareLink] = useState(null);
  const toast = useToast();

  // 日付選択処理
  const handleDateSelect = (info) => {
    if (selectionMode === "range") {
      setSelectedDates([`${info.startStr} ~ ${info.endStr}`]);
    } else {
      setSelectedDates((prev) => [...prev, info.startStr]);
    }
  };

  // 登録処理
  const handleRegister = () => {
    if (!title || selectedDates.length === 0) {
      toast({
        title: "入力不足",
        description: "タイトルと日程を入力してください。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventId = uuidv4();
    setShareLink(`${window.location.origin}/share/${eventId}`);

    toast({
      title: "日程登録完了",
      description: "共有リンクが生成されました！",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={6} maxW="900px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* タイトル入力 */}
        <Box>
          <Text fontWeight="bold" mb={2}>
            タイトル
          </Text>
          <Input
            placeholder="イベントタイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Box>

        {/* カレンダー */}
        <Box>
          <Text fontWeight="bold" mb={2}>
            カレンダー
          </Text>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            selectable={true}
            select={handleDateSelect}
            height="500px"
          />
        </Box>

        {/* 選択モード */}
        <Box>
          <Text fontWeight="bold" mb={2}>
            日程選択モード
          </Text>
          <RadioGroup onChange={setSelectionMode} value={selectionMode}>
            <HStack spacing={6}>
              <Radio value="range">範囲選択</Radio>
              <Radio value="multi">複数選択</Radio>
            </HStack>
          </RadioGroup>
        </Box>

        {/* 時間帯 */}
        <Box>
          <Text fontWeight="bold" mb={2}>
            時間帯
          </Text>
          <RadioGroup onChange={setTimeOption} value={timeOption}>
            <VStack align="start" spacing={2}>
              <Radio value="allday">終日</Radio>
              <Radio value="daytime">昼</Radio>
              <Radio value="night">夜</Radio>
              <Radio value="custom">指定（1時〜0時）</Radio>
            </VStack>
          </RadioGroup>
        </Box>

        {/* 登録ボタン */}
        <Button
          colorScheme="pink"
          size="lg"
          onClick={handleRegister}
          bgGradient="linear(to-r, #FDB9C8, #004CA0)"
          color="white"
          _hover={{ transform: "scale(1.05)", boxShadow: "0 0 12px #FDB9C8" }}
        >
          登録して共有リンクを発行
        </Button>

        {/* 共有リンク */}
        {shareLink && (
          <Box mt={4}>
            <Text fontWeight="bold">共有リンク:</Text>
            <RouterLink to={shareLink.replace(window.location.origin, "")}>
              {shareLink}
            </RouterLink>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default RegisterPage;
