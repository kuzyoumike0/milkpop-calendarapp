import React from "react";
import { Box, Heading } from "@chakra-ui/react";

function Layout({ children }) {
  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, #FDB9C8, black, #004CA0)"
      backgroundSize="400% 400%"
      animation="gradientMove 15s ease infinite"
      display="flex"
      flexDirection="column"
    >
      {/* ヘッダー */}
      <Box
        as="header"
        p={4}
        textAlign="center"
        bg="rgba(0,0,0,0.6)"
        backdropFilter="blur(6px)"
        borderBottom="1px solid rgba(255,255,255,0.2)"
      >
        <Heading
          size="lg"
          bgGradient="linear(to-r, #FDB9C8, #004CA0)"
          bgClip="text"
          fontWeight="extrabold"
        >
          MilkPOP Calendar
        </Heading>
      </Box>

      {/* メインコンテンツ */}
      <Box as="main" flex="1" p={8} display="flex" justifyContent="center">
        {children}
      </Box>

      {/* フッター */}
      <Box
        as="footer"
        textAlign="center"
        p={4}
        fontSize="sm"
        color="whiteAlpha.700"
        bg="rgba(0,0,0,0.6)"
        borderTop="1px solid rgba(255,255,255,0.2)"
      >
        © 2025 MilkPOP Calendar
      </Box>

      {/* 背景アニメーション */}
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </Box>
  );
}

export default Layout;
