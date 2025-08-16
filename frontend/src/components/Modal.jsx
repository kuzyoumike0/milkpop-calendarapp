import React from 'react';

export default function Modal({ open, title, onClose, children }){
  if(!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <strong>{title}</strong>
          <button className="close" onClick={onClose}>閉じる</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
