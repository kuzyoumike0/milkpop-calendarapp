import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Layout from "./Layout";

export default function TopPage() {
  const cardBg = useColorModeValue("whiteAlpha.200", "blackAlpha.300");
  const cardBorder = useColorModeValue("whiteAlpha.300", "whiteAlpha.400");

  return (
    <Layout>
      <Container maxW="6xl" py={10}>
        <VStack spacing={10} textAlign="center">
          <Heading
            fontSize={{ base: "3xl", md: "5xl" }}
            bgGradient="linear(to-r, #FDB9C8, #004CA0)"
            bgClip="text"
            fontWeight="extrabold"
          >
            ようこそ MilkPOP Calendar へ
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} maxW="2xl" color="gray.200">
            あなたの予定を簡単に登録・共有できるお洒落なカレンダーアプリです。
          </Text>

          {/* カード群 */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
            {/* 日程登録ページ */}
            <Box
              p={6}
              bg={cardBg}
              borderRadius="2xl"
              boxShadow="lg"
              border="1px solid"
              borderColor={cardBorder}
              _hover={{
                transform: "scale(1.02)",
                transition: "0.3s",
                boxShadow: "0 0 25px rgba(253,185,200,0.6)",
              }}
            >
              <VStack spacing={4}>
                <Heading size="lg" color="#FDB9C8">
                  日程登録ページ
                </Heading>
                <Text color="gray.300">
                  タイトル、カレンダーUI、日程範囲・複数選択、時間帯を登録できます。
                </Text>
                <Button
                  as={RouterLink}
                  to="/register"
                  size="lg"
                  borderRadius="full"
                  bgGradient="linear(to-r, #FDB9C8, #004CA0)"
                  color="white"
                  _hover={{
                    transform: "scale(1.07)",
                    boxShadow: "0 0 15px #FDB9C8",
                  }}
                  _active={{ transform: "scale(0.95)" }}
                >
                  移動する
                </Button>
              </VStack>
            </Box>

            {/* 個人スケジュール */}
            <Box
              p={6}
              bg={cardBg}
              borderRadius="2xl"
              boxShadow="lg"
              border="1px solid"
              borderColor={cardBorder}
              _hover={{
                transform: "scale(1.02)",
                transition: "0.3s",
                boxShadow: "0 0 25px rgba(0,76,160,0.6)",
              }}
            >
              <VStack spacing={4}>
                <Heading size="lg" color="#004CA0">
                  個人スケジュール
                </Heading>
                <Text color="gray.300">
                  自分だけの予定をカレンダーに登録して、タイトルやメモを管理できます。
                </Text>
                <Button
                  as={RouterLink}
                  to="/personal"
                  size="lg"
                  borderRadius="full"
                  bgGradient="linear(to-r, #004CA0, #FDB9C8)"
                  color="white"
                  _hover={{
                    transform: "scale(1.07)",
                    boxShadow: "0 0 15px #004CA0",
                  }}
                  _active={{ transform: "scale(0.95)" }}
                >
                  移動する
                </Button>
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>
    </Layout>
  );
}
