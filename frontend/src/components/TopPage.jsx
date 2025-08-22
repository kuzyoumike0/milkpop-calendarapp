import React from "react";
import { Link } from "react-router-dom";
import { Flex, Heading, Spacer, HStack, Text } from "@chakra-ui/react";

const Header = () => {
  return (
    <Flex
      as="header"
      bgGradient="linear(to-r, #FDB9C8, #004CA0)"
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
  );
};

export default Header;
