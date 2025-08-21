import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  RadioGroup,
  Radio,
  useToast,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";

function RegisterPage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeType, setTimeType] = useState("allday");
  const [shareLink, setShareLink] = useState("");
  const toast = useToast();

  // 日付範囲・複数選択
  const handleSelect = (info) => {
    const newEvent = {
      start: info.startStr,
      end: info.endStr,
      allDay: info.allDay,
    };
    setSelectedDates((prev) => [...prev, newEvent]);
    toast({
      title: "日程を追加しました",
      description: `${info.startStr} ~ ${info.endStr}`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // 共有リンク発行
  const handleGenerateLink = () => {
    if (!title || selectedDates.length === 0) {
      toast({
        title: "入力が不足しています",
        description: "タイトルと日程を選択してください",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    const fakeLink = `${window.location.origin}/share?title=${encodeURIComponent(
      title
    )}`;
    setShareLink(fakeLink);
  };

  return (
    <Box p={6}>
      <Card bg="gray.800" color="white" shadow="xl" borderRadius="2xl">
        <CardHeader>
          <Text fontSize="2xl" fontWeight="bold" color="brand.pink">
            📅 日程登録ページ
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* タイトル入力 */}
            <Box>
              <Text mb={2}>タイトル</Text>
              <Input
                placeholder="イベント名を入力"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                bg="white"
                color="black"
              />
            </Box>

            {/* 時間帯選択 */}
            <Box>
              <Text mb={2}>時間帯を選択</Text>
              <RadioGroup value={timeType} onChange={setTimeType}>
                <HStack spacing={6}>
                  <Radio value="allday">終日</Radio>
                  <Radio value="day">昼</Radio>
                  <Radio value="night">夜</Radio>
                  <Radio value="custom">時間指定</Radio>
                </HStack>
              </RadioGroup>
            </Box>

            {/* カレンダー */}
            <Box bg="white" color="black" borderRadius="lg" p={3}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={true}
                select={handleSelect}
                height="600px"
              />
            </Box>

            {/* 共有リンク生成 */}
            <Button
              colorScheme="pink"
              size="lg"
              onClick={handleGenerateLink}
              bg="brand.pink"
              _hover={{ bg: "pink.400" }}
            >
              🔗 共有リンクを発行
            </Button>

            {shareLink && (
              <Box>
                <Text>発行されたリンク:</Text>
                <Text
                  as="a"
                  href={shareLink}
                  target="_blank"
                  color="brand.blue"
                  fontWeight="bold"
                >
                  {shareLink}
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}

export default RegisterPage;
