import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";

export default function ShareLinkPage() {
  const { id } = useParams(); // URLの :id を取得
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/schedules/${id}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        setSchedule(data);
      } catch (err) {
        setSchedule(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Container maxW="4xl" py={20} textAlign="center">
        <Spinner size="xl" color="pink.300" />
        <Text mt={4}>読み込み中...</Text>
      </Container>
    );
  }

  if (!schedule) {
    return (
      <Container maxW="4xl" py={20} textAlign="center">
        <Heading size="lg" color="red.300">
          予定が見つかりません
        </Heading>
        <Text mt={2}>リンクが間違っているか、削除された可能性があります。</Text>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={10}>
      <VStack spacing={6}>
        <Heading
          size="2xl"
          bgGradient="linear(to-r, #FDB9C8, #004CA0)"
          bgClip="text"
        >
          共有された日程
        </Heading>

        {/* タイトル */}
        <Box
          w="100%"
          p={6}
          borderRadius="xl"
          bg="whiteAlpha.100"
          border="1px solid"
          borderColor="whiteAlpha.300"
          textAlign="center"
        >
          <Text fontSize="2xl" fontWeight="bold">
            {schedule.title}
          </Text>
        </Box>

        {/* 日程リスト */}
        <Box
          w="100%"
          p={6}
          borderRadius="xl"
          bg="whiteAlpha.50"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <Heading size="md" mb={4}>
            選択された日程
          </Heading>
          {schedule.dates && schedule.dates.length > 0 ? (
            schedule.dates.map((d, i) => (
              <Text key={i} fontSize="lg" color="cyan.200">
                📅 {d}
              </Text>
            ))
          ) : (
            <Text color="gray.400">日程が未設定です。</Text>
          )}
        </Box>

        {/* 時間帯 */}
        <Box
          w="100%"
          p={6}
          borderRadius="xl"
          bg="whiteAlpha.50"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <Heading size="md" mb={2}>
            時間帯
          </Heading>
          <Text fontSize="lg" color="pink.200">
            {schedule.timetype === "allday"
              ? "終日"
              : schedule.timetype === "day"
              ? "昼"
              : schedule.timetype === "night"
              ? "夜"
              : "時間指定"}
          </Text>
        </Box>

        {/* 戻る */}
        <Button
          mt={6}
          borderRadius="full"
          bgGradient="linear(to-r, #FDB9C8, #004CA0)"
          color="white"
          _hover={{
            transform: "scale(1.07)",
            boxShadow: "0 0 15px #FDB9C8",
          }}
          onClick={() => (window.location.href = "/")}
        >
          トップへ戻る
        </Button>
      </VStack>
    </Container>
  );
}
