import React, { useState } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  RadioGroup,
  Radio,
  Stack,
  Select,
  HStack,
  Text
} from "@chakra-ui/react";
import { DatePicker } from "@mantine/dates";
import { v4 as uuidv4 } from "uuid";
import Layout from "./Layout";
import "dayjs/locale/ja";

function RegisterPage() {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("single"); // single, range, multiple
  const [dates, setDates] = useState([]);
  const [timeMode, setTimeMode] = useState("allday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [shareUrl, setShareUrl] = useState("");

  // 保存処理（ここではリンク生成だけ）
  const handleSave = () => {
    const link = `${window.location.origin}/share/${uuidv4()}`;
    setShareUrl(link);
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
        <Heading size="md" mb={6} color="#FDB9C8">
          日程登録ページ
        </Heading>

        <VStack spacing={6} align="stretch">
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

          {/* 日程範囲選択 */}
          <FormControl>
            <FormLabel>日程選択モード</FormLabel>
            <RadioGroup onChange={setMode} value={mode}>
              <Stack direction="row">
                <Radio value="single">単日</Radio>
                <Radio value="range">範囲選択</Radio>
                <Radio value="multiple">複数選択</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>

          {/* カレンダーUI */}
          <FormControl>
            <FormLabel>カレンダー</FormLabel>
            {mode === "single" && (
              <DatePicker value={dates} onChange={setDates} locale="ja" />
            )}
            {mode === "range" && (
              <DatePicker type="range" value={dates} onChange={setDates} locale="ja" />
            )}
            {mode === "multiple" && (
              <DatePicker type="multiple" value={dates} onChange={setDates} locale="ja" />
            )}
          </FormControl>

          {/* 時間帯 */}
          <FormControl>
            <FormLabel>時間帯</FormLabel>
            <Select value={timeMode} onChange={(e) => setTimeMode(e.target.value)}>
              <option value="allday">終日</option>
              <option value="day">昼</option>
              <option value="night">夜</option>
              <option value="custom">指定時刻</option>
            </Select>
          </FormControl>

          {timeMode === "custom" && (
            <HStack>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                bg="white"
                color="black"
              />
              <Text>〜</Text>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                bg="white"
                color="black"
              />
            </HStack>
          )}

          {/* 保存ボタン */}
          <Button
            size="lg"
            borderRadius="full"
            bgGradient="linear(to-r, #FDB9C8, #004CA0)"
            color="white"
            onClick={handleSave}
            _hover={{ transform: "scale(1.05)", boxShadow: "0 0 15px #FDB9C8" }}
          >
            登録して共有リンクを発行
          </Button>

          {/* 共有リンク表示 */}
          {shareUrl && (
            <Box mt={4}>
              <Text fontWeight="bold">共有リンク:</Text>
              <Text color="yellow.300">{shareUrl}</Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Layout>
  );
}

export default RegisterPage;
