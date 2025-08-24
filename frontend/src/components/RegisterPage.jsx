/* ====== 共通設定 ====== */
body {
  background: linear-gradient(135deg, #FDB9C8, #004CA0);
  color: #fff;
  font-family: 'Zen Maru Gothic', 'M PLUS Rounded 1c', sans-serif;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

h1, h2, h3 {
  font-family: 'M PLUS Rounded 1c', sans-serif;
  margin: 0.5rem 0;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.6);
}

/* ====== ヘッダー ====== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  border-bottom: 2px solid #FDB9C8;
  padding: 0.8rem 1.5rem;
  color: #fff;
  position: relative;
  z-index: 1000;
}

.logo-link {
  font-family: 'Mochiy Pop P One', 'Kaisei Decol', sans-serif !important;
  font-size: 2rem;
  font-weight: bold;
  color: #FDB9C8;
  text-decoration: none;
  padding: 0.4rem 1rem;
  border-radius: 10px;
  transition: 0.3s;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
}
.logo-link:hover {
  color: #50C878;
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  gap: 1.2rem;
}
.nav-links a {
  font-family: 'M PLUS Rounded 1c', sans-serif;
  color: #fff;
  text-decoration: none;
  font-weight: bold;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition: 0.3s;
}
.nav-links a:hover {
  background: linear-gradient(90deg, #FDB9C8, #50C878);
  color: #000;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

/* ====== ハンバーガー ====== */
.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
  z-index: 1001;
}
.hamburger span {
  width: 25px;
  height: 3px;
  background: #fff;
  border-radius: 5px;
  transition: 0.4s;
}
.hamburger.open span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}
.hamburger.open span:nth-child(2) {
  opacity: 0;
}
.hamburger.open span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* モバイルメニュー */
.nav-links-mobile {
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.95);
  position: absolute;
  top: 100%;
  right: 0;
  width: 220px;
  border-radius: 0 0 12px 12px;
  padding: 1rem;
  box-shadow: 0 6px 16px rgba(0,0,0,0.6);
  transform: translateY(-20px);
  opacity: 0;
  pointer-events: none;
  transition: all 0.4s ease;
}
.nav-links-mobile.open {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}
.nav-links-mobile a {
  color: #fff;
  padding: 0.8rem;
  margin: 0.4rem 0;
  border-radius: 6px;
  transition: 0.3s;
  text-align: right;
  font-weight: bold;
}
.nav-links-mobile a:hover {
  background: linear-gradient(90deg, #FDB9C8, #50C878);
  color: #000;
  transform: translateX(-5px);
}

/* ====== Discordログインボタン ====== */
.discord-login {
  background: linear-gradient(90deg, #5865F2, #4e5bd5);
  color: #fff;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-family: 'M PLUS Rounded 1c', sans-serif;
  transition: 0.3s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
.discord-login:hover {
  background: linear-gradient(90deg, #FDB9C8, #50C878);
  color: #000;
}

/* ====== フッター ====== */
footer {
  background: rgba(0, 0, 0, 0.7);
  color: #FDB9C8;
  text-align: center;
  padding: 1.2rem;
  font-size: 1rem;
  font-family: 'Mochiy Pop P One', 'Kaisei Decol', sans-serif;
  border-top: 2px solid #004CA0;
  margin-top: auto;
}
.footer-links {
  margin-top: 0.8rem;
  display: flex;
  justify-content: center;
  gap: 2.5rem;
}
.footer-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #FDB9C8;
  font-size: 1rem;
  text-decoration: none;
  transition: 0.3s;
}
.footer-link:hover {
  color: #50C878;
  transform: scale(1.05);
}
.footer-icon {
  font-size: 18px;
  transition: 0.3s;
}
.footer-link:hover .footer-icon {
  color: #50C878;
}

/* ====== RegisterPage レイアウト ====== */
.page-container {
  max-width: 1200px;
  margin: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-title {
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 2px 2px 6px rgba(0,0,0,0.7);
  margin-bottom: 1rem;
}

/* ====== 選択日程リスト ====== */
.options-section {
  background: linear-gradient(135deg, #1a1a1a, #000);
  border: 2px solid #FDB9C8;
  border-radius: 12px;
  padding: 1.5rem;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
  margin-top: 1.5rem;
  width: 100%;
  max-width: 600px;
}
.selected-date {
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

/* ===== 共通プルダウン ===== */
.time-select,
.dropdown-btn {
  background: linear-gradient(135deg, #fff, #ffe6ef);
  border: 2px solid #FDB9C8;
  border-radius: 12px;
  padding: 0.5rem 1rem;
  font-weight: bold;
  font-size: 0.95rem;
  color: #333;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 3px 8px rgba(0,0,0,0.15);
}
.time-select:hover,
.dropdown-btn:hover {
  background: linear-gradient(135deg, #FDB9C8, #50C878);
  color: #fff;
  box-shadow: 0 0 12px rgba(253,185,200,0.7);
  transform: scale(1.05);
}
.time-select option {
  background: #333;
  color: #fff;
  font-weight: bold;
  padding: 0.5rem;
}

/* ===== 開始〜終了の時間入力を一体感あるデザインに ===== */
.custom-time {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: 1rem;
}

.custom-time input[type="time"] {
  border: 2px solid #FDB9C8;
  background: #fff;
  color: #333;
  font-weight: bold;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  transition: 0.3s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.custom-time input[type="time"]:focus {
  border-color: #50C878;
  box-shadow: 0 0 8px rgba(80,200,120,0.6);
  outline: none;
}

.custom-time .separator {
  font-weight: bold;
  color: #FDB9C8;
  font-size: 1rem;
  padding: 0 0.3rem;
}
