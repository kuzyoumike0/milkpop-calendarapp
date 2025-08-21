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
import NavButton from "./NavButton";

const TopPage = () => {
  return (
    <Box minH="100vh" bg="black" color="white" py={10}>
      <Container maxW="container.md" textAlign="center">
        {/* バナー */}
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

        {/* ナビゲーションボタン */}
        <VStack spacing={6}>
          <Wrap spacing={4} justify="center">
            <WrapItem>
              <NavButton to="/" gradient="linear(to-r, #FDB9C8, #004CA0)">
                トップ
              </NavButton>
            </WrapItem>
            <WrapItem>
              <NavButton to="/register" gradient="linear(to-r, #FDB9C8, #004CA0)">
                日程登録
              </NavButton>
            </WrapItem>
            <WrapItem>
              <NavButton to="/personal" gradient="linear(to-r, #004CA0, #FDB9C8)">
                個人スケジュール
              </NavButton>
            </WrapItem>
            <WrapItem>
              <NavButton to="/share" gradient="linear(to-r, #FDB9C8, #004CA0)">
                共有ページ
              </NavButton>
            </WrapItem>
          </Wrap>
        </VStack>
      </Container>
    </Box>
  );
};

export default TopPage;
