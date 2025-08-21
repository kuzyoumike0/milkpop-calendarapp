import "./index.css";   // ✅ 最初に置く
import "react-calendar/dist/Calendar.css"; // 外部CSSは後
import App from "./App";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
