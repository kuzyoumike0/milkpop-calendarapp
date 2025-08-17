window.onload=()=>{
  renderCalendar('calendar');
  const start=document.getElementById('startHour');
  const end=document.getElementById('endHour');
  for(let h=1;h<=24;h++){
    const opt=document.createElement('option');opt.value=h;opt.text=h;start.appendChild(opt.cloneNode(true));end.appendChild(opt);
  }
  document.getElementById('save').onclick=async()=>{
    const title=document.getElementById('title').value;
    const date=window.selectedDate;
    const res=await fetch('/api/shared/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,date})});
    const data=await res.json();
    document.getElementById('link').innerHTML='<a href="/share_session.html?token='+data.token+'">共有リンク</a>';
  };
}
