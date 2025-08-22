/* =========================
   🌸 MilkPOP Calendar 共通
   ========================= */

.page-container {
  padding: 20px;
  color: #fff;
  background: linear-gradient(135deg, #004CA0, #000);
  min-height: 100vh;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #FDB9C8;
}

.card {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.input {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: none;
  margin-bottom: 12px;
}

.radio-group {
  display: flex;
  gap: 20px;
  margin: 12px 0;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
}

.btn {
  background: #FDB9C8;
  color: #000;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: 0.3s;
}
.btn:hover {
  background: #004CA0;
  color: #fff;
}

/* =========================
   🎨 カレンダー MilkPOP テーマ
   ========================= */

.calendar-wrapper {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.react-calendar {
  width: 90% !important;
  max-width: 800px;
  background: rgba(0, 0, 0, 0.6) !important;
  border: none !important;
  border-radius: 20px !important;
  padding: 20px !important;
  box-shadow: 0 8px 30px rgba(0,0,0,0.5) !important;
  color: #fff !important;
  font-family: 'Segoe UI', sans-serif !important;
  backdrop-filter: blur(10px) !important;
}

/* 月ナビゲーション */
.react-calendar__navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
}
.react-calendar__navigation button {
  background: none !important;
  border: none !important;
  color: #FDB9C8 !important;
  font-size: 1.2rem !important;
  font-weight: bold !important;
  cursor: pointer !important;
  padding: 8px 12px !important;
  border-radius: 8px !important;
  transition: 0.3s !important;
}
.react-calendar__navigation button:hover {
  background: rgba(253, 185, 200, 0.2) !important;
}

/* 曜日 */
.react-calendar__month-view__weekdays {
  text-transform: uppercase !important;
  font-weight: bold !important;
  color: #FDB9C8 !important;
  text-align: center !important;
}

/* 日付セル */
.react-calendar__tile {
  border-radius: 10px !important;
  padding: 12px !important;
  margin: 2px !important;
  transition: all 0.3s ease !important;
  text-align: center !important;
  font-size: 1rem !important;
  background: transparent !important;
}
.react-calendar__tile:hover {
  background: rgba(253, 185, 200, 0.25) !important;
  transform: scale(1.05) !important;
}

/* 今日 */
.react-calendar__tile--now {
  background: rgba(0, 76, 160, 0.6) !important;
  color: #fff !important;
  font-weight: bold !important;
  border-radius: 12px !important;
}

/* 選択した日 */
.selected-tile {
  background: #004CA0 !important;
  color: #fff !important;
  font-weight: bold !important;
  border-radius: 50% !important;
  box-shadow: 0 0 12px rgba(0, 76, 160, 0.7) !important;
}

/* 祝日 */
.holiday-tile {
  background: #FDB9C8 !important;
  color: #000 !important;
  font-weight: bold !important;
  border-radius: 50% !important;
  box-shadow: 0 0 10px rgba(253, 185, 200, 0.7) !important;
}
