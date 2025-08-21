import React from "react";
import { Box, Heading, Container, Wrap, WrapItem } from "@chakra-ui/react";
import ShareButton from "./ShareButton";

const RegisterPage = () => {
  return (
    <Box minH="100vh" bg="gray.900" color="white" py={10}>
      <Container maxW="container.md" textAlign="center">
        <Heading mb={6}>📅 日程登録ページ</Heading>

        <Wrap spacing={4} justify="center">
          <WrapItem>
            <ShareButton to="/" gradient="linear(to-r, #FDB9C8, #004CA0)">
              トップへ戻る
            </ShareButton>
          </WrapItem>
        </Wrap>
      </Container>
    </Box>
  );
};

export default RegisterPage;
