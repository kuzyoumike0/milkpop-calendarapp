// ✅ API呼び出し修正
const createLink = async () => {
  try {
    const res = await axios.post("/api/links", {
      title,
      dates: selectedDates,   // 複数日をまとめて登録
    });
    setShareUrl(`${window.location.origin}/share/${res.data.shareId}`);
  } catch (err) {
    console.error("リンク作成失敗", err);
  }
};
