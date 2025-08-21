import React, { useState } from "react";
import {
  Box, Button, Heading, VStack, HStack, Select, Text
} from "@chakra-ui/react";
import Layout from "./Layout";

function SharePage() {
  const [schedules, setSchedules] = useState([
    { id: 1, title: "打ち合わせ", date: "2025-08-25", choice: "" },
    { id: 2, title: "飲み会", date: "2025-08-27", choice: "" },
  ]);

  const handleChange = (id, value) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, choice: value } : s))
    );
  };

  return (
    <Layout>
      <Box
        bg="rgba(255,255,255,0.08)"
        backdropFilter="blur(12px)"
        borderRadius="2xl"
        p={8}
        maxW="700px"
        w="100%"
        border="1px solid rgba(255,255,255,0.2)"
        boxShadow="lg"
      >
        <Heading size="md" mb={6} color="#004CA0">
          日程共有ページ
        </Heading>
        <VStack spacing={4} align="stretch">
          {schedules.map((s) => (
            <HStack
              key={s.id}
              justify="space-between"
              bg="rgba(0,0,0,0.3)"
              p={4}
              borderRadius="lg"
            >
              <Box>
                <Text fontWeight="bold">{s.title}</Text>
                <Text fontSize="sm">{s.date}</Text>
              </Box>
              <Select
                placeholder="選択"
                value={s.choice}
                onChange={(e) => handleChange(s.id, e.target.value)}
                bg="white"
                color="black"
                w="120px"
              >
                <option value="ok">〇</option>
                <option value="ng">✖</option>
              </Select>
            </HStack>
          ))}
        </VStack>
        <Button
          mt={6}
          size="lg"
          borderRadius="full"
          bgGradient="linear(to-r, #FDB9C8, #004CA0)"
          color="white"
          _hover={{ transform: "scale(1.05)", boxShadow: "0 0 15px #004CA0" }}
        >
          保存する
        </Button>
      </Box>
    </Layout>
  );
}

export default SharePage;
