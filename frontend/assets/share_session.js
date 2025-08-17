(function(){
  const $ = (id)=>document.getElementById(id);
  const qs = new URLSearchParams(location.search);
  const token = qs.get('token');

  const statusEl = $('status');
  const titleEl = $('shareTitle');
  const nameEl = $('memberName');
  const memoEl = $('memoText');
  const wrap = $('allowedWrap');
  const regsEl = $('regs');

  if(!token){ statusEl.textContent='token がありません'; }

  function fmtJP(iso){
    const d = new Date(iso + 'T00:00:00');
    const w = ['日','月','火','水','木','金','土'][d.getDay()];
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} (${w})`;
  }
  function hourOptions(){
    const arr = [];
    for(let h=1; h<=24; h++){ arr.push(String(h).padStart(2,'0')+':00'); }
    return arr;
  }
  function row(date){
    const hours = hourOptions();
    return `
      <div class="allowed-row" data-date="${date}">
        <div class="badge">${fmtJP(date)}</div>
        <div class="radio-group">
          <label><input type="radio" name="type-${date}" value="x" checked> ×</label>
          <label><input type="radio" name="type-${date}" value="am"> 午前</label>
          <label><input type="radio" name="type-${date}" value="pm"> 午後</label>
          <label><input type="radio" name="type-${date}" value="allday"> 終日</label>
          <label><input type="radio" name="type-${date}" value="range"> 時間指定</label>
        </div>
        <div class="range-wrap">
          <select class="start" disabled>
            ${hours.map(h=>`<option value="${h}">${h}</option>`).join('')}
          </select>
          〜
          <select class="end" disabled>
            ${hours.map(h=>`<option value="${h}">${h}</option>`).join('')}
          </select>
        </div>
        <label class="pick"><input type="checkbox" class="ck">選択</label>
      </div>`;
  }
  function bindRow(el){
    const radios = el.querySelectorAll('input[type="radio"]');
    const st = el.querySelector('.start'), en = el.querySelector('.end');
    const refresh = ()=>{
      const v = [...radios].find(r=>r.checked)?.value;
      const on = (v === 'range');
      st.disabled = !on; en.disabled = !on;
      el.querySelector('.range-wrap').style.opacity = on ? '1' : '.6';
    };
    radios.forEach(r=>r.addEventListener('change', refresh));
    refresh();
  }
  function buildSlot(el){
    const date = el.dataset.date;
    const radios = el.querySelectorAll('input[type="radio"]');
    const v = [...radios].find(r=>r.checked)?.value;
    if(v === 'x' || v === 'am' || v === 'pm' || v === 'allday') return { date, time_slot:v };
    if(v === 'range'){
      const st = el.querySelector('.start').value;
      const en = el.querySelector('.end').value;
      if(!st || !en || en <= st) throw new Error('終了時刻は開始より後にしてください');
      return { date, time_slot:`time:${st}-${en}` };
    }
    return null;
  }

  async function load(){
    const r = await fetch(`/api/shared/session/${encodeURIComponent(token)}`);
    if(!r.ok){ statusEl.textContent='セッション読込に失敗'; return; }
    const s = await r.json();
    titleEl.textContent = s.title || '共有スケジュール';
    const dates = Array.isArray(s.allowed_dates)? s.allowed_dates : [];
    wrap.innerHTML = dates.sort((a,b)=> new Date(a)-new Date(b)).map(d=>row(d)).join('');
    wrap.querySelectorAll('.allowed-row').forEach(bindRow);

    const r2 = await fetch(`/api/shared/session/${encodeURIComponent(token)}/events`);
    const list = r2.ok ? await r2.json() : [];
    renderRegs(list);
  }

  function chip(ts){
    if(ts==='x') return '<span class="chip x">×</span>';
    if(ts==='am') return '<span class="chip am">午前</span>';
    if(ts==='pm') return '<span class="chip pm">午後</span>';
    if(ts==='allday') return '<span class="chip all">終日</span>';
    if(/^time:\d{2}:\d{2}-\d{2}:\d{2}$/.test(ts)){
      const [a,b] = ts.replace('time:','').split('-');
      return `<span class="chip time">${a}〜${b}</span>`;
    }
    return ts;
  }
  function renderRegs(list){
    const sorted = [...list].sort((a,b)=> new Date(a.date)-new Date(b.date) || (a.member_name||'').localeCompare(b.member_name||''));
    let html = '<table class="table"><thead><tr><th>日付</th><th>時間</th><th>名前</th><th>メモ</th></tr></thead><tbody>';
    for(const it of sorted){
      html += `<tr><td>${fmtJP(it.date)}</td><td>${chip(it.time_slot)}</td><td>${it.member_name||''}</td><td>${it.memo||''}</td></tr>`;
    }
    html += '</tbody></table>';
    regsEl.innerHTML = html;
  }

  $('register').onclick = async ()=>{
    try{
      statusEl.textContent='';
      const name = (nameEl.value||'').trim();
      if(!name){ statusEl.textContent='名前を入力してください'; return; }
      const picks = [];
      wrap.querySelectorAll('.allowed-row').forEach(row=>{
        if(row.querySelector('.ck').checked){
          const p = buildSlot(row);
          if(p) picks.push(p);
        }
      });
      if(picks.length===0){ statusEl.textContent='少なくとも1日選択してください'; return; }
      for(const p of picks){
        const r = await fetch(`/api/shared/session/${encodeURIComponent(token)}/register`, {
          method:'POST',
          headers:{'content-type':'application/json'},
          body: JSON.stringify({ date: p.date, time_slot: p.time_slot, member_name: name, memo: (memoEl.value||null) })
        });
        if(!r.ok){
          const t = await r.text();
          throw new Error('登録失敗: '+t);
        }
      }
      await load();
      statusEl.textContent = '登録しました';
    }catch(e){
      console.error(e); statusEl.textContent = e.message || '登録に失敗しました';
    }
  };

  load().catch(e=>{ console.error(e); statusEl.textContent='初期化エラー'; });
})();