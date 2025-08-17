window.onload=()=>{
  renderCalendar('calendar');
  const start=document.getElementById('pstartHour');
  const end=document.getElementById('pendHour');
  for(let h=1;h<=24;h++){
    const opt=document.createElement('option');opt.value=h;opt.text=h;start.appendChild(opt.cloneNode(true));end.appendChild(opt);
  }
  document.getElementById('psave').onclick=async()=>{
    const title=document.getElementById('ptitle').value;
    const date=window.selectedDate;
    await fetch('/api/personal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,date})});
    alert('保存しました');
  };
}
