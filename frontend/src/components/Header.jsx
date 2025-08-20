import { Link } from "react-router-dom";

export default function Header() {
  return (
    <div className="header flex justify-between items-center">
      <span>MilkPOP Calendar</span>
      <div className="flex gap-4">
        <Link to="/personal" className="btn-main">個人スケジュール</Link>
        <Link to="/link" className="btn-main">日程登録</Link>
      </div>
    </div>
  );
}
