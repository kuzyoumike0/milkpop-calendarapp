import React from "react";
import { Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const ShareButton = ({ to, gradient, children }) => {
  return (
    <Button
      as={RouterLink}
      to={to}
      bgGradient={gradient}
      color="white"
      px={6}
      py={4}
      rounded="xl"
      shadow="md"
      _hover={{
        opacity: 0.85,
        transform: "scale(1.05)",
      }}
      transition="all 0.2s ease-in-out"
    >
      {children}
    </Button>
  );
};

export default ShareButton;
