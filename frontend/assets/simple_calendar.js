
export function makeCalendar(root, { onChange, multi=true }) {
  const state = {
    view: (()=>{ const d=new Date(); return { y:d.getFullYear(), m:d.getMonth() }; })(),
    selected: new Set()
  };
  const el = typeof root === 'string' ? document.querySelector(root) : root;
  el.innerHTML = `<div class="calendar card">
    <div class="cal-head">
      <button class="btn secondary" data-act="prev">‹</button>
      <div><span class="badge" data-title></span></div>
      <button class="btn secondary" data-act="next">›</button>
    </div>
    <div class="small" style="margin-bottom:6px;">日 月 火 水 木 金 土</div>
    <div class="cal-grid" data-grid></div>
  </div>`;

  const grid = el.querySelector('[data-grid]');
  const title = el.querySelector('[data-title]');

  function fmt(y,m,d){ return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
  function todayISO(){
    const jp = new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Tokyo'}));
    return fmt(jp.getFullYear(), jp.getMonth(), jp.getDate());
  }

  function render(){
    const { y, m } = state.view;
    title.textContent = `${y}年 ${m+1}月`;
    grid.innerHTML = '';
    const first = new Date(y, m, 1);
    const start = (first.getDay()+7)%7;
    const days = new Date(y, m+1, 0).getDate();
    for (let i=0;i<start;i++){
      const c = document.createElement('div'); c.className='cal-cell disabled'; grid.appendChild(c);
    }
    for (let d=1; d<=days; d++){
      const iso = fmt(y,m,d);
      const c = document.createElement('div');
      c.className = 'cal-cell' + (iso===todayISO() ? ' today' : '') + (state.selected.has(iso)?' selected':'');
      c.dataset.iso = iso;
      c.innerHTML = `<div class="d">${d}</div>`;
      c.addEventListener('click', () => {
        if (!multi) state.selected.clear();
        if (state.selected.has(iso)) state.selected.delete(iso); else state.selected.add(iso);
        render();
        onChange?.(Array.from(state.selected).sort());
      });
      grid.appendChild(c);
    }
  }

  el.addEventListener('click', (e)=>{
    const act = e.target.closest('[data-act]')?.dataset?.act;
    if (!act) return;
    if (act==='prev'){ state.view.m--; if (state.view.m<0){ state.view.m=11; state.view.y--; } }
    if (act==='next'){ state.view.m++; if (state.view.m>11){ state.view.m=0; state.view.y++; } }
    render();
  });

  render();
  return {
    setSelected(list){
      state.selected = new Set(list||[]); render();
    },
    getSelected(){ return Array.from(state.selected).sort(); }
  };
}
