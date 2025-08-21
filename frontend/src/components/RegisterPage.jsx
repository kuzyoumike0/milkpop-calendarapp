import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  RadioGroup,
  Radio,
  Stack,
  Text,
  VStack,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]); // 複数選択用
  const [timeType, setTimeType] = useState("allday"); // 時間帯
  const [shareUrl, setShareUrl] = useState("");
  const toast = useToast();
  const { hasCopied, onCopy } = useClipboard(shareUrl);

  // カレンダー日付選択
  const handleDateSelect = (info) => {
    const start = info.startStr;
    const end = info.endStr;

    // 範囲選択 or 単日追加
    if (info.startStr !== info.endStr) {
      setSelectedDates([`${start} ~ ${end}`]);
    } else {
      setSelectedDates((prev) =>
        prev.includes(start)
          ? prev.filter((d) => d !== start)
          : [...prev, start]
      );
    }
  };

  // 登録処理
  const handleSubmit = async () => {
    if (!title || selectedDates.length === 0) {
      toast({
        title: "入力エラー",
        description: "タイトルと日付を入力してください。",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dates: selectedDates,
          timeType,
        }),
      });

      if (!res.ok) throw new Error("登録失敗");

      const data = await res.json();
      const url = `${window.location.origin}/share/${data.id}`;
      setShareUrl(url);

      toast({
        title: "登録成功",
        description: "共有リンクが発行されました。",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "エラー",
        description: "サーバーに接続できません。",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="5xl" py={10}>
      <VStack spacing={6}>
        <Heading
          size="2xl"
          bgGradient="linear(to-r, #FDB9C8, #004CA0)"
          bgClip="text"
        >
          日程登録ページ
        </Heading>

        {/* タイトル */}
        <FormControl>
          <FormLabel>タイトル</FormLabel>
          <Input
            placeholder="例: 夏祭り打ち合わせ"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormControl>

        {/* カレンダー */}
        <Box w="100%" bg="whiteAlpha.100" borderRadius="xl" p={4}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            selectable={true}
            select={handleDateSelect}
            height="auto"
          />
          <Text mt={2} fontSize="sm" color="gray.300">
            → 範囲選択：ドラッグ / 複数選択：クリック
          </Text>
        </Box>

        {/* 時間帯選択 */}
        <FormControl>
          <FormLabel>時間帯</FormLabel>
          <RadioGroup value={timeType} onChange={setTimeType}>
            <Stack direction="row" spacing={6}>
              <Radio value="allday">終日</Radio>
              <Radio value="day">昼</Radio>
              <Radio value="night">夜</Radio>
              <Radio value="custom">時間指定</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        {/* 登録ボタン */}
        <Button
          size="lg"
          borderRadius="full"
          bgGradient="linear(to-r, #FDB9C8, #004CA0)"
          color="white"
          _hover={{
            transform: "scale(1.07)",
            boxShadow: "0 0 15px #FDB9C8",
          }}
          onClick={handleSubmit}
        >
          登録して共有リンク発行
        </Button>

        {/* 共有リンク表示 */}
        {shareUrl && (
          <Box
            mt={6}
            p={4}
            borderRadius="xl"
            border="1px solid"
            borderColor="whiteAlpha.400"
            bg="whiteAlpha.100"
            textAlign="center"
          >
            <Text>共有リンク:</Text>
            <Text color="cyan.300" wordBreak="break-all">
              {shareUrl}
            </Text>
            <Button mt={2} size="sm" onClick={onCopy}>
              {hasCopied ? "コピーしました" : "コピー"}
            </Button>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
