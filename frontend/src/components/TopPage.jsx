import React from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Wrap,
  WrapItem,
  Container,
} from "@chakra-ui/react";
import ShareButton from "./ShareButton";

const TopPage = () => {
  return (
    <Box minH="100vh" bg="black" color="white" py={10}>
      <Container maxW="container.md" textAlign="center">
        <Heading
          as="h1"
          size="2xl"
          bgGradient="linear(to-r, #FDB9C8, #004CA0)"
          bgClip="text"
          fontWeight="bold"
          mb={6}
        >
          MilkPOP Calendar
        </Heading>

        <Text fontSize="lg" mb={10} opacity={0.85}>
          予定を簡単に登録・共有できるお洒落なカレンダーアプリ
        </Text>

        {/* 共通ボタン */}
        <VStack spacing={6}>
          <Wrap spacing={4} justify="center">
            <WrapItem>
              <ShareButton to="/" gradient="linear(to-r, #FDB9C8, #004CA0)">
                トップ
              </ShareButton>
            </WrapItem>
            <WrapItem>
              <ShareButton to="/register" gradient="linear(to-r, #FDB9C8, #004CA0)">
                日程登録
              </ShareButton>
            </WrapItem>
            <WrapItem>
              <ShareButton to="/personal" gradient="linear(to-r, #004CA0, #FDB9C8)">
                個人スケジュール
              </ShareButton>
            </WrapItem>
            <WrapItem>
              <ShareButton to="/share" gradient="linear(to-r, #FDB9C8, #004CA0)">
                共有ページ
              </ShareButton>
            </WrapItem>
          </Wrap>
        </VStack>
      </Container>
    </Box>
  );
};

export default TopPage;
