/* 全体背景 */
body {
  margin: 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  color: #333;
}

/* コンテナ */
.container {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

/* タイトル */
h1, h2, h3 {
  text-align: center;
  color: #444;
}

/* カレンダーリスト */
.calendar-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

/* カレンダーアイテム */
.calendar-item {
  padding: 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.calendar-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

/* 全日・昼・夜の色分け */
.calendar-item[data-time="全日"] {
  border-left: 6px solid #ff6b6b;
}

.calendar-item[data-time="昼"] {
  border-left: 6px solid #feca57;
}

.calendar-item[data-time="夜"] {
  border-left: 6px solid #1e90ff;
}

/* ボタン */
button {
  padding: 8px 16px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  margin-top: 8px;
}

/* ボタン色 */
button.add-shared {
  background-color: #ff6b6b;
  color: white;
}

button.add-personal {
  background-color: #1e90ff;
  color: white;
}

button:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

/* 入力欄 */
input, select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-top: 4px;
  width: 100%;
  box-sizing: border-box;
}
