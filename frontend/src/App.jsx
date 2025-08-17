import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SharedLinkPage from "./pages/SharedLinkPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/shared/:shareId" element={<SharedLinkPage />} />
        <Route path="/" element={<SharedLinkPage />} />
      </Routes>
    </Router>
  );
}
