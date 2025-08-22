import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";   // ← これが必要
import "react-calendar/dist/Calendar.css"; // react-calendar の標準CSS
import App from "./App";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
