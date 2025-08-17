function renderCalendar(containerId){
  const container=document.getElementById(containerId||'calendar');
  container.innerHTML='';
  const today=new Date();
  const year=today.getFullYear();
  const month=today.getMonth();
  const first=new Date(year,month,1);
  const startDay=first.getDay();
  const lastDate=new Date(year,month+1,0).getDate();
  const weeks=[];
  let cells=[];
  for(let i=0;i<startDay;i++){cells.push('');}
  for(let d=1;d<=lastDate;d++){
    cells.push(d);
    if((cells.length)%7===0){weeks.push(cells);cells=[];}
  }
  if(cells.length>0){while(cells.length<7)cells.push('');weeks.push(cells);}
  weeks.forEach(week=>{
    week.forEach(day=>{
      const div=document.createElement('div');
      div.className='day';
      if(day!==''){div.textContent=day;}
      if(day===today.getDate()){div.classList.add('today');}
      div.onclick=()=>{
        document.querySelectorAll('.day').forEach(d=>d.classList.remove('selected'));
        div.classList.add('selected');
        window.selectedDate=new Date(year,month,day);
      };
      container.appendChild(div);
    });
  });
}
