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
      <Heading mb={12} textAlign="center" color="white" fontWeight="bold" letterSpacing="2px">
        MilkPOP Calendar
      </Heading>

      {/* カードグリッド */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        {/* カード1 */}
        <Box
          bg="rgba(255,255,255,0.05)"
          backdropFilter="blur(12px)"
          borderRadius="2xl"
          p={8}
          w="100%"
          maxW="400px"
          boxShadow="dark-lg"
          border="1px solid rgba(255,255,255,0.2)"
          transition="all 0.3s ease"
          _hover={{
            transform: "translateY(-8px)",
            borderColor: "brand.pink",
            boxShadow: "0 0 20px #FDB9C8",
          }}
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="brand.pink">日程登録ページ</Heading>
            <Text fontSize="sm">新しい日程を登録しましょう。</Text>
            <Button
              size="lg"
              borderRadius="full"
              bgGradient="linear(to-r, #FDB9C8, #004CA0)"
              _hover={{ opacity: 0.9, transform: "scale(1.05)" }}
              _active={{ transform: "scale(0.95)" }}
            >
              移動する
            </Button>
          </VStack>
        </Box>

        {/* カード2 */}
        <Box
          bg="rgba(255,255,255,0.05)"
          backdropFilter="blur(12px)"
          borderRadius="2xl"
          p={8}
          w="100%"
          maxW="400px"
          boxShadow="dark-lg"
          border="1px solid rgba(255,255,255,0.2)"
          transition="all 0.3s ease"
          _hover={{
            transform: "translateY(-8px)",
            borderColor: "brand.blue",
            boxShadow: "0 0 20px #004CA0",
          }}
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="brand.blue">個人スケジュール</Heading>
            <Text fontSize="sm">あなた専用の予定を登録できます。</Text>
            <Button
              size="lg"
              borderRadius="full"
              bgGradient="linear(to-r, #004CA0, #FDB9C8)"
              _hover={{ opacity: 0.9, transform: "scale(1.05)" }}
              _active={{ transform: "scale(0.95)" }}
            >
              移動する
            </Button>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default TopPage;
