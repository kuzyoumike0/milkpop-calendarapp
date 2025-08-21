{/* ナビゲーションボタン */}
<HStack spacing={6} justify="center">
  <Button
    as={RouterLink}
    to="/"
    size="sm"
    borderRadius="full"
    bgGradient="linear(to-r, #FDB9C8, #004CA0)"
    color="white"
    _hover={{ transform: "scale(1.05)", boxShadow: "0 0 12px #FDB9C8" }}
    _active={{ transform: "scale(0.95)" }}
  >
    トップ
  </Button>
  <Button
    as={RouterLink}
    to="/register"   // ← 日程登録ページを追加
    size="sm"
    borderRadius="full"
    bgGradient="linear(to-r, #FDB9C8, #004CA0)"
    color="white"
    _hover={{ transform: "scale(1.05)", boxShadow: "0 0 12px #FDB9C8" }}
    _active={{ transform: "scale(0.95)" }}
  >
    日程登録
  </Button>
  <Button
    as={RouterLink}
    to="/personal"
    size="sm"
    borderRadius="full"
    bgGradient="linear(to-r, #004CA0, #FDB9C8)"
    color="white"
    _hover={{ transform: "scale(1.05)", boxShadow: "0 0 12px #004CA0" }}
    _active={{ transform: "scale(0.95)" }}
  >
    個人スケジュール
  </Button>
  <Button
    as={RouterLink}
    to="/share"
    size="sm"
    borderRadius="full"
    bgGradient="linear(to-r, #FDB9C8, #004CA0)"
    color="white"
    _hover={{ transform: "scale(1.05)", boxShadow: "0 0 12px #FDB9C8" }}
    _active={{ transform: "scale(0.95)" }}
  >
    共有ページ
  </Button>
</HStack>
