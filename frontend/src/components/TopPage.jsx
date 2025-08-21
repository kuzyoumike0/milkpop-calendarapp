import React from "react";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";

function TopPage() {
  return (
    <Box p={8}>
      <Heading mb={6} textAlign="center" color="brand.pink">
        MilkPOP Calendar
      </Heading>

      <VStack spacing={6}>
        {/* カード1 */}
        <Box
          bg="rgba(255,255,255,0.05)"
          border="1px solid"
          borderColor="brand.blue"
          borderRadius="xl"
          p={6}
          boxShadow="lg"
          _hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
          transition="all 0.2s"
          w="100%"
          maxW="400px"
        >
          <Heading size="md" mb={3}>日程登録ページ</Heading>
          <Text mb={4}>新しい日程を登録しましょう。</Text>
          <Button colorScheme="pink" w="full">移動する</Button>
        </Box>

        {/* カード2 */}
        <Box
          bg="rgba(255,255,255,0.05)"
          border="1px solid"
          borderColor="brand.blue"
          borderRadius="xl"
          p={6}
          boxShadow="lg"
          _hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
          transition="all 0.2s"
          w="100%"
          maxW="400px"
        >
          <Heading size="md" mb={3}>個人スケジュール</Heading>
          <Text mb={4}>あなた専用の予定を登録できます。</Text>
          <Button colorScheme="blue" w="full">移動する</Button>
        </Box>
      </VStack>
    </Box>
  );
}

export default TopPage;
