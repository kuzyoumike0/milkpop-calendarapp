import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import RegisterPage from "./components/RegisterPage";
import SharePage from "./components/SharePage";

function App() {
  return (
    <Router>
      <Header />
      <main style={{ flex: 1, padding: "2rem" }}>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/share/:id" element={<SharePage />} /> {/* 追加 */}
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
