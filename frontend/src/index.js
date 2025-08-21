// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import App from "./App";

// Chakra UI
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        // ❌ 背景は指定しない
        margin: 0,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: "#333",
      },
      "#root": {
        background: "transparent",
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
