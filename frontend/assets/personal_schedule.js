(function(){
  const $ = (id)=>document.getElementById(id)
  const nameEl = $('userName')
  const memoEl = $('memoText')
  const bodyEl = $('selBody')
  const mineWrap = $('mineWrap')
  const statusEl = $('status')

  const calendar = SimpleCalendar.buildCalendar(document.getElementById('calendar'), {
    onChange: renderSelected
  })

  function hourOptions(){
    const arr=[]; for(let h=1; h<=24; h++){ const lab = String(h).padStart(2,'0') + ':00'; arr.push(lab) } return arr
  }
  function renderSelected(dates){
    const hours = hourOptions()
    bodyEl.innerHTML = dates.map(d=>{
      const id = 'p_'+d.replaceAll('-','')
      return `<tr data-date="${d}">
        <td><span class="reg-badge">${fmtJP(d)}</span></td>
        <td>
          <div class="compact-row" style="gap:10px">
            <label><input type="radio" name="type-${id}" value="x" checked> ×</label>
            <label><input type="radio" name="type-${id}" value="am"> 午前</label>
            <label><input type="radio" name="type-${id}" value="pm"> 午後</label>
            <label><input type="radio" name="type-${id}" value="allday"> 終日</label>
            <label><input type="radio" name="type-${id}" value="range"> 時間指定</label>
          </div>
        </td>
        <td>
          <div class="compact-row time-range" data-for="${id}" style="gap:6px; opacity:.6">
            <select class="startSel" disabled>${hours.map(h=>`<option value="${h}">${h}</option>`).join('')}</select>
            〜
            <select class="endSel" disabled>${hours.map(h=>`<option value="${h}">${h}</option>`).join('')}</select>
          </div>
        </td>
        <td><button class="ghost rm">削除</button></td>
      </tr>`
    }).join('')
    // activate rows
    for(const tr of bodyEl.querySelectorAll('tr')){
      const id = 'p_'+tr.dataset.date.replaceAll('-','')
      const radios = tr.querySelectorAll(`input[name="type-${id}"]`)
      const rangeWrap = tr.querySelector(`.time-range[data-for="${id}"]`)
      const startSel = tr.querySelector('.startSel')
      const endSel   = tr.querySelector('.endSel')
      const refresh = ()=>{
        const val = [...radios].find(r=>r.checked)?.value
        const on = (val==='range')
        startSel.disabled = !on
        endSel.disabled   = !on
        rangeWrap.style.opacity = on ? '1' : '.6'
      }
      radios.forEach(r=>r.addEventListener('change', refresh))
      refresh()
      tr.querySelector('.rm').onclick = ()=>{
        const cur = calendar.getSelected().filter(x=> x!==tr.dataset.date)
        calendar.setSelected(cur)
        renderSelected(cur)
      }
    }
  }

  function buildTimeSlot(tr){
    const id = 'p_'+tr.dataset.date.replaceAll('-','')
    const type = [...tr.querySelectorAll(`input[name="type-${id}"]`)].find(r=>r.checked)?.value || 'x'
    if(type==='x' || type==='am' || type==='pm' || type==='allday') return type
    const st = tr.querySelector('.startSel').value
    const en = tr.querySelector('.endSel').value
    if(!st || !en) return ''
    if(en<=st) throw new Error('終了は開始より後にしてください')
    return `time:${st}-${en}`
  }

  function fmtJP(iso){
    const d = new Date(iso+'T00:00:00')
    const y = d.getFullYear(), m = d.getMonth()+1, dd=d.getDate()
    const w = ['日','月','火','水','木','金','土'][d.getDay()]
    return `${y}/${String(m).padStart(2,'0')}/${String(dd).padStart(2,'0')} (${w})`
  }

  async function loadMine(){
    const user = (nameEl.value||'').trim()
    const url = user ? `/api/personal?user=${encodeURIComponent(user)}` : '/api/personal'
    const r = await fetch(url)
    const list = r.ok ? await r.json() : []
    const sorted = [...list].sort((a,b)=> new Date(a.date) - new Date(b.date))
    let html = '<table class="table"><thead><tr><th>日付</th><th>時間</th><th>メモ</th><th></th></tr></thead><tbody>'
    for(const it of sorted){
      html += `<tr data-id="${it.id}">
        <td><span class="reg-badge">${fmtJP(it.date)}</span></td>
        <td>${chipFromTime(it.time_slot)}</td>
        <td>${it.memo?escapeHtml(it.memo):''}</td>
        <td><button class="danger del">削除</button></td>
      </tr>`
    }
    html += '</tbody></table>'
    mineWrap.innerHTML = html
    mineWrap.querySelectorAll('.del').forEach(btn=>{
      btn.onclick = async ()=>{
        const tr = btn.closest('tr')
        const id = tr.dataset.id
        const user = (nameEl.value||'').trim()
        if(!user){ statusEl.textContent='名前を先に入力してください'; return }
        const r = await fetch(`/api/personal/${id}`, { method:'DELETE', headers:{'content-type':'application/json'}, body: JSON.stringify({ user_name: user }) })
        if(!r.ok){ statusEl.textContent='削除に失敗しました'; return }
        statusEl.textContent='削除しました'
        loadMine()
      }
    })
  }

  function chipFromTime(ts){
    if(ts==='x') return '<span class="chip x">×</span>'
    if(ts==='am') return '<span class="chip am">午前</span>'
    if(ts==='pm') return '<span class="chip pm">午後</span>'
    if(ts==='allday') return '<span class="chip all">終日</span>'
    if(/^time:\d{2}:\d{2}-\d{2}:\d{2}$/.test(ts)){
      const t = ts.replace('time:','').split('-')
      return `<span class="chip time">${t[0]}〜${t[1]}</span>`
    }
    return `<span class="chip">${ts||''}</span>`
  }
  const escapeHtml = (s)=> s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]))

  $('saveAll').onclick = async ()=>{
    try{
      statusEl.textContent=''
      const user = (nameEl.value||'').trim()
      if(!user){ statusEl.textContent='名前を入力してください'; return }
      const rows = [...bodyEl.querySelectorAll('tr')]
      if(rows.length===0){ statusEl.textContent='カレンダーで日付を選択してください'; return }
      for(const tr of rows){
        const date = tr.dataset.date
        const ts = buildTimeSlot(tr)
        if(!ts){ statusEl.textContent='時間指定が未設定の行があります'; return }
        const r = await fetch('/api/personal', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ user_name: user, date, time_slot: ts, memo: (memoEl.value||null) }) })
        if(!r.ok){ const t = await r.text(); throw new Error('登録失敗: '+t) }
      }
      statusEl.textContent='登録しました'
      loadMine()
    }catch(e){
      console.error(e)
      statusEl.textContent = e.message || '登録に失敗しました'
    }
  }

  nameEl.addEventListener('change', loadMine)
  loadMine()
})();