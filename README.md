# MilkPop Calendar (Self-made Calendar)

## 起動
```bash
docker compose up --build
# または
docker build -t milkpop .
docker run --rm -p 8080:8080 -e PUBLIC_BASE_URL="http://localhost:8080" milkpop
```
- 共有リンク発行: `/shared.html`
- 共有リンク先: `/share_session.html?token=...`
- 個人スケジュール: `/personal.html`
