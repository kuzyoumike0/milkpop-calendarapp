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
  Link,
  Card,
  CardBody,
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

  // カレンダーに反映するイベント
  const events = selectedDates.map((date, idx) => ({
    id: idx.toString(),
    title: selectionMode === "range" ? "選択中の範囲" : "選択日",
    start: Array.isArray(date) ? date[0] : date,
    end: Array.isArray(date) ? date[1] : date,
    display: "background",
    backgroundColor: selectionMode === "range" ? "#FDB9C8" : "#004CA0",
    borderColor: "#fff",
  }));

  // 日付選択処理
  const handleDateSelect = (info) => {
    if (selectionMode === "range") {
      setSelectedDates([[info.startStr, info.endStr]]);
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
    <Box bg="black" minH="100vh" color="white" py={10} px={6}>
      <Card maxW="900px" mx="auto" bg="rgba(255,255,255,0.05)" boxShadow="xl" borderRadius="2xl">
        <CardBody>
          <VStack spacing={8} align="stretch">
            {/* タイトル入力 */}
            <Box>
              <Text fontWeight="bold" mb={2} fontSize="lg">
                タイトル
              </Text>
              <Input
                placeholder="イベントタイトルを入力"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                bg="white"
                color="black"
              />
            </Box>

            {/* カレンダー */}
            <Box>
              <Text fontWeight="bold" mb={2} fontSize="lg">
                カレンダー（日付を選択）
              </Text>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={true}
                select={handleDateSelect}
                events={events}
                height="500px"
              />
            </Box>

            {/* 選択モード */}
            <Box>
              <Text fontWeight="bold" mb={2} fontSize="lg">
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
              <Text fontWeight="bold" mb={2} fontSize="lg">
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
              size="lg"
              onClick={handleRegister}
              bgGradient="linear(to-r, #FDB9C8, #004CA0)"
              color="white"
              _hover={{ transform: "scale(1.05)", boxShadow: "0 0 12px #FDB9C8" }}
              borderRadius="full"
            >
              登録して共有リンクを発行
            </Button>

            {/* 共有リンク */}
            {shareLink && (
              <Box textAlign="center" mt={4} p={4} bg="rgba(255,255,255,0.1)" borderRadius="lg">
                <Text fontWeight="bold" mb={2}>共有リンク</Text>
                <Link as={RouterLink} to={shareLink.replace(window.location.origin, "")} color="#FDB9C8" isExternal>
                  {shareLink}
                </Link>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default RegisterPage;
