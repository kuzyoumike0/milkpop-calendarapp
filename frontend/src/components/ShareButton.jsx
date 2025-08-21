import React from "react";
import { Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const ShareButton = ({ to, children }) => {
  return (
    <Button
      as={RouterLink}
      to={to}
      bgGradient="linear(to-r, brandPink, brandBlue)"
      color="white"
      px={6}
      py={4}
      rounded="xl"
      shadow="md"
      fontWeight="bold"
      _hover={{
        opacity: 0.9,
        transform: "scale(1.05)",
        bgGradient: "linear(to-r, brandBlue, brandPink)", // hover時に逆グラデーション
      }}
      transition="all 0.2s ease-in-out"
    >
      {children}
    </Button>
  );
};

export default ShareButton;
