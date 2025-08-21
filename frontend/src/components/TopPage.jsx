import React from "react";
import { Box, Button, Heading, Text, SimpleGrid, VStack } from "@chakra-ui/react";

function TopPage() {
  return (
    <Box p={8}>
      {/* ページタイトル */}
      <Heading mb={10} textAlign="center" color="brand.pink">
        MilkPOP Calendar
      </Heading>

      {/* カードエリア */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} justifyItems="center">
        {/* 日程登録ページ */}
        <Box
          bg="rgba(255,255,255,0.05)"
          border="1px solid"
          borderColor="brand.blue"
          borderRadius="xl"
          p={8}
          w="100%"
          maxW="400px"
          boxShadow="lg"
          _hover={{ transform: "translateY(-6px)", boxShadow: "2xl" }}
          transition="all 0.3s ease"
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="brand.pink">日程登録ページ</Heading>
            <Text fontSize="sm">新しい日程を登録しましょう。</Text>
            <Button colorScheme="pink" size="lg" borderRadius="full">
              移動する
            </Button>
          </VStack>
        </Box>

        {/* 個人スケジュール */}
        <Box
          bg="rgba(255,255,255,0.05)"
          border="1px solid"
          borderColor="brand.blue"
          borderRadius="xl"
          p={8}
          w="100%"
          maxW="400px"
          boxShadow="lg"
          _hover={{ transform: "translateY(-6px)", boxShadow: "2xl" }}
          transition="all 0.3s ease"
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="brand.blue">個人スケジュール</Heading>
            <Text fontSize="sm">あなた専用の予定を登録できます。</Text>
            <Button colorScheme="blue" size="lg" borderRadius="full">
              移動する
            </Button>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default TopPage;
