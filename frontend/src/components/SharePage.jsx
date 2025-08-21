// frontend/src/components/SharePage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardBody,
  Text,
  VStack,
  Badge,
  List,
  ListItem,
} from "@chakra-ui/react";

// 仮データ: 実際はバックエンドAPIから取得する
const dummyEvents = {
  "1234-5678": {
    title: "夏祭り打ち合わせ",
    dates: ["2025-08-25", "2025-08-26"],
    timeOption: "夜",
  },
  "abcd-efgh": {
    title: "チーム開発MTG",
    dates: ["2025-09-01"],
    timeOption: "昼",
  },
};

const SharePage = () => {
  const { id } = useParams(); // /share/:id の :id を取得
  const eventData = dummyEvents[id]; // 仮データ参照

  return (
    <Box bg="black" minH="100vh" color="white" py={10} px={6}>
      <Card maxW="700px" mx="auto" bg="rgba(255,255,255,0.05)" boxShadow="xl" borderRadius="2xl">
        <CardBody>
          {eventData ? (
            <VStack spacing={6}>
              {/* タイトル */}
              <Text fontSize="2xl" fontWeight="bold" color="#FDB9C8">
                {eventData.title}
              </Text>

              {/* 日程一覧 */}
              <Box w="100%">
                <Text fontWeight="bold" mb={2}>選択された日程</Text>
                <List spacing={2}>
                  {eventData.dates.map((d, i) => (
                    <ListItem key={i}>
                      <Badge colorScheme="pink" mr={2}>日程 {i + 1}</Badge>
                      {d}
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* 時間帯 */}
              <Box>
                <Text fontWeight="bold" mb={2}>時間帯</Text>
                <Badge colorScheme="blue">{eventData.timeOption}</Badge>
              </Box>
            </VStack>
          ) : (
            <Text fontSize="lg" color="gray.400">
              ⚠️ この共有リンクは無効です
            </Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default SharePage;
