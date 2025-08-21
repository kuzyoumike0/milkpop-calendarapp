// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import App from "./App";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";

// Chakra UI のテーマ設定
const theme = extendTheme({
  styles: {
    global: {
      body: {
        // ここは削除またはコメントアウト
        // bg: "white",
        // color: "black",
      },
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
