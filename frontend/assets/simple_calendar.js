(function(){
  function buildCalendar(el, opts){
    const state = {
      ym: new Date(), // current month
      selected: new Set()
    };
    if(opts?.initialYM) state.ym = new Date(opts.initialYM);
    const wrap = document.createElement('div');
    wrap.className = 'cal';
    wrap.innerHTML = `
      <div class="cal-head">
        <button class="ghost prev">←</button>
        <div class="title"></div>
        <button class="ghost next">→</button>
      </div>
      <div class="cal-dow cal-grid"></div>
      <div class="cal-grid days"></div>
    `;
    el.appendChild(wrap);
    const title = wrap.querySelector('.title');
    const days = wrap.querySelector('.days');
    const dow = wrap.querySelector('.cal-dow');
    const dows = ['日','月','火','水','木','金','土'];
    dows.forEach(w=>{
      const s = document.createElement('div');
      s.textContent = w;
      s.className = 'dow';
      dow.appendChild(s);
    });

    function ymd(d){ const y=d.getFullYear(), m=('0'+(d.getMonth()+1)).slice(-2), dd=('0'+d.getDate()).slice(-2); return `${y}-${m}-${dd}`; }
    function firstOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
    function lastOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }

    function render(){
      const y = state.ym.getFullYear();
      const m = state.ym.getMonth()+1;
      title.textContent = `${y}年 ${m}月`;
      days.innerHTML='';
      const f = firstOfMonth(state.ym);
      const l = lastOfMonth(state.ym);
      const start = new Date(f); start.setDate(f.getDate() - f.getDay()); // Sunday start
      for(let i=0;i<42;i++){
        const cur = new Date(start); cur.setDate(start.getDate()+i);
        const div = document.createElement('div');
        div.className='cell';
        if(cur.getMonth()!==state.ym.getMonth()) div.classList.add('muted');
        const key = ymd(cur);
        if(state.selected.has(key)) div.classList.add('sel');
        div.dataset.date = key;
        div.innerHTML = `<span>${cur.getDate()}</span>`;
        div.onclick = ()=>{
          if(state.selected.has(key)) state.selected.delete(key); else state.selected.add(key);
          render();
          opts?.onChange && opts.onChange(Array.from(state.selected).sort());
        };
        days.appendChild(div);
      }
    }
    wrap.querySelector('.prev').onclick = ()=>{ state.ym.setMonth(state.ym.getMonth()-1); render(); };
    wrap.querySelector('.next').onclick = ()=>{ state.ym.setMonth(state.ym.getMonth()+1); render(); };
    render();
    return {
      getSelected: ()=> Array.from(state.selected).sort(),
      setSelected: (arr)=>{ state.selected = new Set(arr||[]); render(); }
    };
  }
  window.SimpleCalendar = { buildCalendar };
})();