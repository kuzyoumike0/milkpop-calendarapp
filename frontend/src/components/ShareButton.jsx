import React from "react";
import { Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";

const MotionButton = motion(Button);

const ShareButton = ({ to, children, gradient }) => {
  return (
    <MotionButton
      as={RouterLink}
      to={to}
      size="sm"
      borderRadius="full"
      bgGradient={gradient}
      color="white"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      _hover={{ boxShadow: "0 0 12px rgba(253, 185, 200, 0.8)" }}
    >
      {children}
    </MotionButton>
  );
};

export default ShareButton;
