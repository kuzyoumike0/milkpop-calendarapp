// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import RegisterPage from "./components/RegisterPage";

function App() {
  return (
    <Router>
      <Header />
      <main style={{ flex: "1" }}>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
