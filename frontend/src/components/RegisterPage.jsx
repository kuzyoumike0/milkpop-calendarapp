import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Card,
  CardBody,
  Heading,
  Input,
  VStack,
  Button,
  RadioGroup,
  Radio,
  HStack,
  Text,
  Badge,
} from "@chakra-ui/react";

import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [timeOption, setTimeOption] = useState("終日");
  const [shareUrl, setShareUrl] = useState("");

  const handleDateClick = (info) => {
    const dateStr = info.dateStr;
    if (dates.includes(dateStr)) {
      setDates(dates.filter((d) => d !== dateStr));
    } else {
      setDates([...dates, dateStr]);
    }
  };

  const handleSelect = (info) => {
    const range = [];
    let cur = new Date(info.start);
    while (cur <= info.end) {
      range.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    setDates(Array.from(new Set([...dates, ...range])));
  };

  const handleSave = async () => {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dates, timeOption }),
    });
    const data = await res.json();

    if (data.id) {
      setShareUrl(`${window.location.origin}/share/${data.id}`);
    }
  };

  return (
    <Box bg="black" minH="100vh" color="white" py={10} px={6}>
      <Card
        maxW="900px"
        mx="auto"
        bg="rgba(255,255,255,0.05)"
        boxShadow="xl"
        borderRadius="2xl"
        p={4}
      >
        <CardBody>
          <VStack spacing={6}>
            <Heading size="lg" color="#FDB9C8">
              日程登録
            </Heading>

            <Input
              placeholder="タイトルを入力してください"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              bg="white"
              color="black"
            />

            {/* カレンダー */}
            <Box
              w="100%"
              border="1px solid #FDB9C8"
              borderRadius="md"
              overflow="hidden"
              bg="rgba(255,255,255,0.02)"
            >
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={true}
                select={handleSelect}
                dateClick={handleDateClick}
                events={dates.map((d) => ({
                  title: "✔ 選択",
                  date: d,
                  color: "#FDB9C8",
                  textColor: "white",
                }))}
                height="auto"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "",
                }}
                dayMaxEventRows={2}
              />
            </Box>

            <Box>
              <Text mb={2}>時間帯を選択</Text>
              <RadioGroup onChange={setTimeOption} value={timeOption}>
                <HStack spacing={6}>
                  <Radio value="終日">終日</Radio>
                  <Radio value="昼">昼</Radio>
                  <Radio value="夜">夜</Radio>
                  <Radio value="時間指定">時間指定</Radio>
                </HStack>
              </RadioGroup>
            </Box>

            <Button
              onClick={handleSave}
              colorScheme="pink"
              w="full"
              bgGradient="linear(to-r, #FDB9C8, #004CA0)"
              _hover={{ transform: "scale(1.05)", boxShadow: "0 0 12px #FDB9C8" }}
            >
              登録して共有リンクを発行
            </Button>

            {shareUrl && (
              <Box mt={4}>
                <Text mb={2}>共有リンク:</Text>
                <Badge colorScheme="blue" p={2} borderRadius="md">
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                    {shareUrl}
                  </a>
                </Badge>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default RegisterPage;
