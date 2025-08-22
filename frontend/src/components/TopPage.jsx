import React from "react";
import { Box, Flex, Heading, Image, Text } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";

// ✅ public/logo.png を使う場合はこちら
// const logoPath = "/logo.png";

// ✅ src/assets/logo.png を使う場合はこちら
import logo from "../assets/logo.png";

const TopPage = () => {
  return (
    <Flex direction="column" minH="100vh" bg="brand.lightPink">
      {/* ===== ヘッダー ===== */}
      <Header />

      {/* ===== メイン ===== */}
      <Flex
        as="main"
        direction="column"
        align="center"
        justify="center"
        flex="1"
        pt="120px"
        pb="60px"
      >
        {/* ロゴ */}
        <Box mb={10}>
          {/* public に置いた場合 → <Image src={logoPath} alt="MilkPOP Logo" maxW="1040px" /> */}
          <Image src={logo} alt="MilkPOP Logo" maxW="1040px" />
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
      <Footer />
    </Flex>
  );
};

export default TopPage;
