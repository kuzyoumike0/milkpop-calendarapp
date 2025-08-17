export function renderCalendar(containerId, onSelect) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year,month,1).getDay();
  const lastDate = new Date(year,month+1,0).getDate();

  for(let i=0;i<firstDay;i++){
    const empty=document.createElement('div');
    container.appendChild(empty);
  }

  for(let d=1;d<=lastDate;d++){
    const cell=document.createElement('div');
    cell.textContent=d;
    cell.onclick=()=>{
      container.querySelectorAll('div').forEach(c=>c.classList.remove('selected'));
      cell.classList.add('selected');
      onSelect(`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
    };
    container.appendChild(cell);
  }
}
