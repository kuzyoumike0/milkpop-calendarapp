import React from "react";
import ReactDOM from "react-dom/client";
import "react-big-calendar/lib/css/react-big-calendar.css";  // ← 先に読み込む
import "./index.css";  // ← 最後に読み込む（カスタムを優先）

import App from "./App";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

// Chakra UI のテーマ設定
const theme = extendTheme({
  styles: {
    global: {
      // body の指定は不要
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
