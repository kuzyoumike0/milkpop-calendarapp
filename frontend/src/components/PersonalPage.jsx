import React from "react";
import { Box, Heading, Container, Wrap, WrapItem } from "@chakra-ui/react";
import ShareButton from "./ShareButton";

const PersonalPage = () => {
  return (
    <Box minH="100vh" bg="gray.800" color="white" py={10}>
      <Container maxW="container.md" textAlign="center">
        <Heading mb={6}>👤 個人スケジュール</Heading>

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

export default PersonalPage;
