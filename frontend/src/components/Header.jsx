<header className="banner">
  <h1 className="logo">MilkPOP Calendar</h1>

  {/* ハンバーガー */}
  <button ...>☰</button>

  <nav className={`nav ${menuOpen ? "open" : ""}`}>
    <Link to="/register">日程登録</Link>
    <Link to="/personal">個人スケジュール</Link>
    {user ? (
      <span className="user-info">
        <img src="..." className="avatar" />
        {user.username}
      </span>
    ) : (
      <button className="login-btn" onClick={handleLogin}>
        Discordでログイン
      </button>
    )}
  </nav>
</header>
