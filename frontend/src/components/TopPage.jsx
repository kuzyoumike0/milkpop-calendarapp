import React from "react";

const TopPage = () => {
  const handleDiscordLogin = () => {
    // Discord OAuth2 認証URL
    const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin + "/");
    const scope = "identify"; // 必要に応じて email, guilds なども追加
    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    window.location.href = discordUrl;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* ===== バナー ===== */}
      <header className="shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
          <nav className="nav">
            <a href="/register" className="hover:text-[#FDB9C8]">日程登録</a>
            <a href="/personal" className="hover:text-[#FDB9C8]">個人スケジュール</a>
            <a href="/share-links" className="hover:text-[#FDB9C8]">共有リンク一覧</a>
          </nav>
        </div>

        {/* ===== Discordログインボタン ===== */}
        <button
          onClick={handleDiscordLogin}
          className="bg-[#5865F2] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#4752C4] transition"
        >
          Discordでログイン
        </button>
      </header>

      {/* ===== メイン ===== */}
      <main className="mt-20 text-center">
        <h2 className="text-3xl font-bold text-[#FDB9C8] mb-6">
          ようこそ 🎉 MilkPOP Calendar へ
        </h2>
        <p className="text-lg mb-8">
          スケジュールを登録して、共有リンクを発行し、みんなで調整しましょう！
        </p>

        <div className="flex justify-center gap-6">
          <a href="/register" className="share-btn">📅 日程登録</a>
          <a href="/personal" className="share-btn">📝 個人スケジュール</a>
        </div>
      </main>

      {/* ===== フッター ===== */}
      <footer className="mt-20 text-center text-gray-400">
        <p>© 2025 MilkPOP Calendar</p>
      </footer>
    </div>
  );
};

export default TopPage;
