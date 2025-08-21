<Button
  as={RouterLink}
  to="/register"   // ← ここを修正
  size="lg"
  borderRadius="full"
  bgGradient="linear(to-r, #FDB9C8, #004CA0)"
  color="white"
  _hover={{ transform: "scale(1.07)", boxShadow: "0 0 15px #FDB9C8" }}
  _active={{ transform: "scale(0.95)" }}
>
  移動する
</Button>
