import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/link" element={<LinkPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share/:linkid" element={<SharePage />} />
      </Routes>
    </Router>
  );
}

export default App;
