import axios from "axios";

function ShareButton() {
  const handleShare = async () => {
    try {
      const res = await axios.post("/api/share", { description: "共有テスト" });
      alert("共有リンク: " + window.location.origin + res.data.shareUrl);
    } catch (err) {
      alert("共有リンク発行に失敗しました");
      console.error(err);
    }
  };

  return <button onClick={handleShare}>共有リンクを発行</button>;
}

export default ShareButton;
