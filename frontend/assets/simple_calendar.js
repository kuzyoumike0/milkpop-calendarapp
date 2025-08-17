(function(global){
  function createCalendar(el, options){
    const state = {
      ym: new Date(),
      selected: new Set(),
      mode: 'multi' // multi or range
    };
    if(options?.defaultMode) state.mode = options.defaultMode;
    const header = document.createElement('div');
    header.className = 'cal-header';
    const prev = document.createElement('button'); prev.textContent='‹';
    const next = document.createElement('button'); next.textContent='›';
    const title = document.createElement('div'); title.className='cal-title';
    header.appendChild(prev); header.appendChild(title); header.appendChild(next);
    const grid = document.createElement('div'); grid.className='cal-grid';

    function ymd(d){
      const y=d.getFullYear(), m=('0'+(d.getMonth()+1)).slice(-2), day=('0'+d.getDate()).slice(-2);
      return `${y}-${m}-${day}`;
    }
    function render(){
      grid.innerHTML='';
      const y = state.ym.getFullYear(), m=state.ym.getMonth();
      title.textContent = `${y}年 ${(m+1)}月`;
      const first = new Date(y,m,1);
      const start = new Date(first); start.setDate(1 - ((first.getDay()+6)%7)); // Monday start
      for(let i=0;i<42;i++){
        const d = new Date(start); d.setDate(start.getDate()+i);
        const cell = document.createElement('div'); cell.className='cal-cell';
        const inMonth = d.getMonth()===m;
        if(!inMonth) cell.classList.add('dim');
        const id = ymd(d);
        cell.dataset.date = id;
        cell.innerHTML = `<span class="day">${d.getDate()}</span>`;
        if(state.selected.has(id)) cell.classList.add('selected');
        cell.addEventListener('click',()=>{
          if(state.mode==='multi'){
            if(state.selected.has(id)) state.selected.delete(id);
            else state.selected.add(id);
          }else{
            // range: toggle or extend
            if(state.selected.size===0){ state.selected.add(id); }
            else if(state.selected.size===1){
              const a=[...state.selected][0];
              const aD=new Date(a), bD=new Date(id);
              state.selected.clear();
              const st=aD<bD?aD:bD, en=aD<bD?bD:aD;
              for(let dt=new Date(st); dt<=en; dt.setDate(dt.getDate()+1)){
                state.selected.add(ymd(dt));
              }
            }else{
              state.selected.clear(); state.selected.add(id);
            }
          }
          render();
          options?.onChange?.([...state.selected].sort());
        });
        grid.appendChild(cell);
      }
    }
    prev.onclick=()=>{ state.ym.setMonth(state.ym.getMonth()-1); render(); }
    next.onclick=()=>{ state.ym.setMonth(state.ym.getMonth()+1); render(); }
    el.innerHTML='';
    el.appendChild(header);
    el.appendChild(grid);
    render();
    return {
      getSelected: ()=>[...state.selected].sort(),
      setMode: (m)=>{ state.mode=m; },
    };
  }
  global.SimpleCalendar = { createCalendar };
})(window);
