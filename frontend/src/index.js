// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "react-big-calendar/lib/css/react-big-calendar.css"; // カレンダーCSS
import App from "./App";

// Chakra UI
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "transparent", // ← CSS の背景に任せる
        color: "#333",
        margin: 0,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      },
      "#root": {
        background: "transparent", // root も上書きしない
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
