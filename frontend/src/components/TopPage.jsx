import React from "react";
import { Box, Button, Heading, Text, SimpleGrid, VStack } from "@chakra-ui/react";

function TopPage() {
  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, #FDB9C8, black, #004CA0)"
      p={8}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      {/* タイトル */}
      <Heading mb={12} textAlign="center" color="white">
        MilkPOP Calendar
      </Heading>

      {/* カードエリア */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Box
          bg="gray.800"   // ← 一旦濃い背景にして見やすく
          borderRadius="2xl"
          p={8}
          w="100%"
          maxW="400px"
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="brand.pink">日程登録ページ</Heading>
            <Text>新しい日程を登録しましょう。</Text>
            <Button colorScheme="pink">移動する</Button>
          </VStack>
        </Box>

        <Box
          bg="gray.800"
          borderRadius="2xl"
          p={8}
          w="100%"
          maxW="400px"
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="brand.blue">個人スケジュール</Heading>
            <Text>あなた専用の予定を登録できます。</Text>
            <Button colorScheme="blue">移動する</Button>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default TopPage;
