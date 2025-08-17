import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./pages/TopPage";
import SharedLinkPage from "./pages/SharedLinkPage";
import PersonalPage from "./pages/PersonalPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/shared/:shareId" element={<SharedLinkPage />} />
        <Route path="/personal" element={<PersonalPage />} />
      </Routes>
    </Router>
  );
}
