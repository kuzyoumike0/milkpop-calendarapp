import React from 'react'
export default function Modal({ open, onClose, children, title }){
  if(!open) return null
  return (
    <div className="modal" onClick={onClose}>
      <div className="inner" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3>{title}</h3>
          <button className="button ghost" onClick={onClose}>閉じる</button>
        </div>
        <div style={{marginTop:12}}>{children}</div>
      </div>
    </div>
  )
}
