// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Box, Flex, Heading, Image, Spacer, HStack, Text } from "@chakra-ui/react";
import logo from "../assets/logo.png"; // ← public/logo.png を置くなら "../assets" か "public/logo.png"

const TopPage = () => {
  return (
    <Flex direction="column" minH="100vh" bg="brand.lightPink">
      {/* ===== ヘッダー（バナー） ===== */}
      <Flex
        as="header"
        bgGradient="linear(to-r, brand.pink, brand.blue)"
        color="white"
        p={4}
        align="center"
        position="fixed"
        top="0"
        left="0"
        w="100%"
        zIndex="1000"
      >
        <Heading size="md" letterSpacing="1px">
          MilkPOP Calendar
        </Heading>
        <Spacer />
        <HStack spacing={8}>
          <Link to="/register">
            <Text fontWeight="bold" _hover={{ color: "#ff5fa2" }}>
              日程登録
            </Text>
          </Link>
          <Link to="/personal">
            <Text fontWeight="bold" _hover={{ color: "#ff5fa2" }}>
              個人スケジュール
            </Text>
          </Link>
          <Link to="/share-links">
            <Text fontWeight="bold" _hover={{ color: "#ff5fa2" }}>
              共有リンク一覧
            </Text>
          </Link>
        </HStack>
      </Flex>

      {/* ===== メインコンテンツ ===== */}
      <Flex as="main" direction="column" align="center" justify="center" flex="1" pt="120px" pb="60px">
        {/* ロゴ画像 */}
        <Box mb={10}>
          <Image src={logo} alt="MilkPOP Logo" maxW="400px" />
        </Box>

        <Heading as="h2" size="lg" color="brand.blue" mb={6}>
          ようこそ、MilkPOP Calendar へ
        </Heading>
        <Text color="gray.700" textAlign="center" maxW="lg">
          仲間と予定を共有したり、自分だけのスケジュールを管理できます。
          <br />
          上のメニューから始めましょう！
        </Text>
      </Flex>

      {/* ===== フッター ===== */}
      <Box as="footer" bg="black" color="white" textAlign="center" py={4}>
        © 2025 MilkPOP Calendar
      </Box>
    </Flex>
  );
};

export default TopPage;
