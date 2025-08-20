import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import LinkPage from "./components/LinkPage";
import SharePage from "./components/SharePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/link" element={<LinkPage />} />
        <Route path="/share/:linkid" element={<SharePage />} />
      </Routes>
    </Router>
  );
}

export default App;
