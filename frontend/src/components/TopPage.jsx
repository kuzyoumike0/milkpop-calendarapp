import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div>
      <div className="header">MilkPOP Calendar</div>
      <div className="flex justify-center items-center min-h-screen">
        <div className="card w-11/12 md:w-2/3 text-center">
          <h2 className="text-2xl font-bold mb-4">ようこそ！</h2>
          <p className="mb-6">スケジュールを登録して、共有してみましょう。</p>
          <div className="flex justify-center gap-4">
            <Link to="/link" className="btn-main">日程登録ページへ</Link>
            <Link to="/personal" className="btn-main">個人スケジュールへ</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
