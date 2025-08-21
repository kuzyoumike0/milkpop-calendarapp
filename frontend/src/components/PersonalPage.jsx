import React, { useState } from "react";
import {
  Box, Button, Heading, Input, Textarea, VStack, FormControl,
  FormLabel, RadioGroup, Radio, Stack, Select
} from "@chakra-ui/react";
import Layout from "./Layout";

function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [range, setRange] = useState("single");
  const [time, setTime] = useState("allday");

  return (
    <Layout>
      <Box
        bg="rgba(255,255,255,0.08)"
        backdropFilter="blur(12px)"
        borderRadius="2xl"
        p={8}
        maxW="600px"
        w="100%"
        border="1px solid rgba(255,255,255,0.2)"
        boxShadow="lg"
      >
        <Heading size="md" mb={6} color="#FDB9C8">
          個人スケジュール登録
        </Heading>
        <VStack spacing={5} align="stretch">
          {/* タイトル */}
          <FormControl>
            <FormLabel>タイトル</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="予定のタイトル"
              bg="white"
              color="black"
            />
          </FormControl>

          {/* メモ */}
          <FormControl>
            <FormLabel>メモ</FormLabel>
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="詳細メモを入力"
              bg="white"
              color="black"
            />
          </FormControl>

          {/* 日程範囲選択 */}
          <FormControl>
            <FormLabel>日程範囲</FormLabel>
            <RadioGroup onChange={setRange} value={range}>
              <Stack direction="row">
                <Radio value="single">単日</Radio>
                <Radio value="multi">複数日</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>

          {/* 時間帯 */}
          <FormControl>
            <FormLabel>時間帯</FormLabel>
            <Select value={time} onChange={(e) => setTime(e.target.value)}>
              <option value="allday">終日</option>
              <option value="day">昼</option>
              <option value="night">夜</option>
              <option value="custom">時刻指定</option>
            </Select>
          </FormControl>

          {/* 保存ボタン */}
          <Button
            size="lg"
            borderRadius="full"
            bgGradient="linear(to-r, #FDB9C8, #004CA0)"
            color="white"
            _hover={{ transform: "scale(1.05)", boxShadow: "0 0 15px #FDB9C8" }}
          >
            保存する
          </Button>
        </VStack>
      </Box>
    </Layout>
  );
}

export default PersonalPage;
