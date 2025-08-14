import Calendar from './components/calendar'; // ← 他のファイル参照は削除
;


export default function App() {
  return (
    <Router>
      <div className="nav">
        <Link to="/">共有カレンダー</Link>
        <Link to="/personal">個人カレンダー</Link>
      </div>
      <Routes>
        <Route path="/" element={<Calendar type="shared" />} />
        <Route path="/personal" element={<Calendar type="personal" />} />
      </Routes>
    </Router>
  );
}
