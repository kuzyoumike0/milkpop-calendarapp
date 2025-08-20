// 📌 初期ロード時に responses を取得
useEffect(() => {
  axios
    .get(`/api/responses/${linkId}`)   // ← linkId を指定
    .then((res) => {
      // 返り値は配列なのでそのままセットでOK
      setResponses(Array.isArray(res.data) ? res.data : []);
    })
    .catch((err) => console.error(err));
}, [linkId]);

// 📌 保存後にも再取得
const handleSave = async () => {
  try {
    await Promise.all(
      Object.entries(selected).map(([scheduleId, response]) =>
        axios.post("/api/responses", {
          scheduleId,
          username,
          response,
        })
      )
    );

    // 再取得
    const res = await axios.get(`/api/responses/${linkId}`);
    setResponses(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error(err);
    alert("保存に失敗しました");
  }
};
