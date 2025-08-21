import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardBody,
  Text,
  VStack,
  Badge,
  List,
  ListItem,
} from "@chakra-ui/react";

const SharePage = () => {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => setEventData(data))
      .catch(() => setEventData(null));
  }, [id]);

  return (
    <Box bg="black" minH="100vh" color="white" py={10} px={6}>
      <Card
        maxW="700px"
        mx="auto"
        bg="rgba(255,255,255,0.05)"
        boxShadow="xl"
        borderRadius="2xl"
      >
        <CardBody>
          {eventData ? (
            <VStack spacing={6}>
              <Text fontSize="2xl" fontWeight="bold" color="#FDB9C8">
                {eventData.title}
              </Text>
              <Box w="100%">
                <Text fontWeight="bold" mb={2}>
                  選択された日程
                </Text>
                <List spacing={2}>
                  {eventData.dates.map((d, i) => (
                    <ListItem key={i}>
                      <Badge colorScheme="pink" mr={2}>
                        日程 {i + 1}
                      </Badge>
                      {d}
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box>
                <Text fontWeight="bold" mb={2}>
                  時間帯
                </Text>
                <Badge colorScheme="blue">{eventData.time_option}</Badge>
              </Box>
            </VStack>
          ) : (
            <Text fontSize="lg" color="gray.400">
              ⚠️ この共有リンクは無効です
            </Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default SharePage;
