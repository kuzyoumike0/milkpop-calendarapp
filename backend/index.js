// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      username TEXT,
      linkid TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS holidays (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      date DATE NOT NULL UNIQUE
    );
  `);

  // 日本の祝日を複数年分投入
  const hd = new Holidays("JP");
  const currentYear = new Date().getFullYear();

  for (let y = currentYear; y <= currentYear + 2; y++) {
    const holidays = hd.getHolidays(y);
    for (const h of holidays) {
      try {
        await pool.query(
          `INSERT INTO holidays (name, date) VALUES ($1, $2) ON CONFLICT (date) DO NOTHING`,
          [h.name, h.date]
        );
      } catch (err) {
        console.error("祝日登録失敗:", err);
      }
    }
  }

  console.log("✅ 祝日データ投入完了");
}
