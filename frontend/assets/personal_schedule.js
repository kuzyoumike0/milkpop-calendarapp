(function(){
  const $ = (id)=>document.getElementById(id);
  const cal = SimpleCalendar.createCalendar($('cal'), { defaultMode:'multi' });
  const start = $('start'), end = $('end');

  function hours(){
    const arr=[]; for(let h=1; h<=24; h++){ arr.push(String(h).padStart(2,'0')+':00'); } return arr;
  }
  start.innerHTML = hours().map(h=>`<option value="${h}">${h}</option>`).join('');
  end.innerHTML = hours().map(h=>`<option value="${h}">${h}</option>`).join('');

  function currentTimeSlot(){
    const v = document.querySelector('input[name="slot"]:checked').value;
    if(v==='x' || v==='am' || v==='pm' || v==='allday') return v;
    if(v==='range'){
      if(end.value <= start.value) throw new Error('終了は開始より後を選んでください');
      return `time:${start.value}-${end.value}`;
    }
    return 'x';
  }
  document.querySelectorAll('input[name="slot"]').forEach(r => {
    r.addEventListener('change', ()=>{
      const on = r.value==='range' && r.checked;
      start.disabled = !on; end.disabled = !on;
      document.querySelector('.range-wrap').style.opacity = on ? '1' : '.6';
    });
  });

  async function reload(){
    const user = ($('user').value||'').trim();
    const url = user ? `/api/personal?user=${encodeURIComponent(user)}` : '/api/personal';
    const r = await fetch(url);
    const list = r.ok ? await r.json() : [];
    const rows = list.map(it => `<tr><td>${it.date}</td><td>${it.time_slot}</td><td>${it.user_name}</td><td>${it.memo||''}</td></tr>`).join('');
    $('list').innerHTML = `<table class="table"><thead><tr><th>日付</th><th>時間</th><th>名前</th><th>メモ</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  $('add').onclick = async ()=>{
    try{
      const user = ($('user').value||'').trim();
      if(!user){ alert('名前を入れてください'); return; }
      const dates = cal.getSelected();
      if(dates.length===0){ alert('日付を選んでください'); return; }
      const memo = ($('memo').value||'').trim() || null;
      const ts = currentTimeSlot();

      for(const d of dates){
        const r = await fetch('/api/personal', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ user_name:user, date:d, time_slot:ts, memo }) });
        if(!r.ok){ const t=await r.text(); throw new Error('登録失敗: '+t); }
      }
      await reload();
    }catch(e){ alert(e.message||'登録に失敗しました'); }
  };

  $('user').addEventListener('input', reload);
  reload();
})();