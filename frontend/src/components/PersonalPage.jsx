/* ==== モーダル ==== */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal {
  background: #fff;
  padding: 20px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}
.modal h3 {
  margin-bottom: 15px;
  font-size: 1.2rem;
}

/* モーダル内ボタン */
.option-btn {
  margin: 5px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: #eee;
  cursor: pointer;
  transition: 0.2s;
}
.option-btn.active {
  background: linear-gradient(135deg, #004ca0, #fdb9c8);
  color: white;
  font-weight: bold;
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}
