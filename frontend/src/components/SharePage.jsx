/* ===== ページ全体のコンテナ ===== */
body {
  margin: 0;
  padding: 0;
  font-family: 'Poppins','Noto Sans JP','Reggae One','Yomogi', cursive, sans-serif;
  background: linear-gradient(to bottom, #FDB9C8, #ffffff, #004CA0);
  color: #333;
  line-height: 1.7;
}

/* ===== ヘッダー固定 ===== */
header {
  background: linear-gradient(90deg, #FDB9C8, #004CA0);
  color: white;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.4rem;
  font-weight: bold;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}
header .nav {
  display: flex;
  gap: 32px;
  align-items: center;
}
header .nav a {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: 0.2s;
}
header .nav a:hover {
  color: #ff5fa2;
}

/* ===== フッター固定 ===== */
footer {
  background: black;
  color: white;
  padding: 14px 20px;
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}

/* ===== main の余白 ===== */
main {
  flex: 1;
  margin-top: 80px;
  margin-bottom: 60px;
}

/* ===== カレンダー全体 ===== */
.custom-calendar {
  width: 100%;
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background: linear-gradient(135deg, #fff0f5, #fce4ec);
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  font-family: 'Poppins','Noto Sans JP', sans-serif;
  color: #333;
}

/* ナビゲーション */
.custom-calendar .react-calendar__navigation button {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  font-weight: bold;
  color: #004CA0;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 10px;
  transition: 0.2s;
}
.custom-calendar .react-calendar__navigation button:hover {
  background: #FDB9C8;
  color: white;
}

/* 曜日ラベル */
.custom-calendar .react-calendar__month-view__weekdays {
  text-align: center;
  font-weight: bold;
  color: #004CA0;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

/* 日付タイル */
.custom-calendar .react-calendar__tile {
  padding: 15px 5px;
  border-radius: 12px;
  transition: 0.2s;
  text-align: center;
  font-size: 1rem;
}

/* 今日 */
.custom-calendar .react-calendar__tile--now {
  background: #004CA0 !important;
  color: white !important;
  font-weight: bold;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
}

/* 選択日 */
.custom-calendar .react-calendar__tile--active {
  background: #FDB9C8 !important;
  color: black !important;
  font-weight: bold;
}

/* 範囲選択 */
.custom-calendar .react-calendar__tile--range {
  background: #ffe4ec !important;
  border-radius: 10px;
  color: #333 !important;
}

/* ホバー */
.custom-calendar .react-calendar__tile:hover {
  background: #f8bbd0;
  cursor: pointer;
}

/* 土日 */
.custom-calendar .react-calendar__month-view__days__day--weekend {
  color: #d32f2f;
}
