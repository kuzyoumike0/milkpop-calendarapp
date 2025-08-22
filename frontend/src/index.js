// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";

// react-calendar のデフォルトCSSを先に読む
import "react-calendar/dist/Calendar.css";

// あとから自作CSSを上書きする
import "./index.css";

import App from "./App";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({});
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
