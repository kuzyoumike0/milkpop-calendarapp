import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import Banner from "./components/Banner";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <Banner />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/link" element={<LinkPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/share/:linkid" element={<SharePage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
