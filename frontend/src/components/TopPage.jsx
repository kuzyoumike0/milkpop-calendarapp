import React from "react";
import { Box, Button, Heading, Text, SimpleGrid, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Layout from "./Layout";

function TopPage() {
  return (
    <Layout>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        {/* カード1: 日程登録ページ */}
        <Box
          bg="rgba(255,255,255,0.08)"
          backdropFilter="blur(12px)"
          borderRadius="2xl"
          p={8}
          maxW="400px"
          border="1px solid rgba(255,255,255,0.2)"
          boxShadow="lg"
          transition="all 0.3s"
          _hover={{ transform: "translateY(-8px)", boxShadow: "0 0 25px #FDB9C8", borderColor: "#FDB9C8" }}
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="#FDB9C8">日程登録ページ</Heading>
            <Text fontSize="sm">新しい日程を登録しましょう。</Text>
            <Button
              as={RouterLink}
              to="/share"
              size="lg"
              borderRadius="full"
              bgGradient="linear(to-r, #FDB9C8, #004CA0)"
              color="white"
              _hover={{ transform: "scale(1.07)", boxShadow: "0 0 15px #FDB9C8" }}
              _active={{ transform: "scale(0.95)" }}
            >
              移動する
            </Button>
          </VStack>
        </Box>

        {/* カード2: 個人スケジュール */}
        <Box
          bg="rgba(255,255,255,0.08)"
          backdropFilter="blur(12px)"
          borderRadius="2xl"
          p={8}
          maxW="400px"
          border="1px solid rgba(255,255,255,0.2)"
          boxShadow="lg"
          transition="all 0.3s"
          _hover={{ transform: "translateY(-8px)", boxShadow: "0 0 25px #004CA0", borderColor: "#004CA0" }}
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="#004CA0">個人スケジュール</Heading>
            <Text fontSize="sm">あなた専用の予定を登録できます。</Text>
            <Button
              as={RouterLink}
              to="/personal"
              size="lg"
              borderRadius="full"
              bgGradient="linear(to-r, #004CA0, #FDB9C8)"
              color="white"
              _hover={{ transform: "scale(1.07)", boxShadow: "0 0 15px #004CA0" }}
              _active={{ transform: "scale(0.95)" }}
            >
              移動する
            </Button>
          </VStack>
        </Box>
      </SimpleGrid>
    </Layout>
  );
}

export default TopPage;
