(function(){
  const $ = (id)=>document.getElementById(id)
  const statusEl = $('status')
  const titleEl = $('shareTitle')
  const nameEl = $('memberName')
  const memoEl = $('memoText')
  const allowedBody = $('allowedBody')
  const registerBtn = $('registerSelected')
  const regsWrap = $('regsWrap')
  const filterNameEl = $('filterName')

  const fmtJP = (iso)=> {
    const d = new Date(iso+'T00:00:00')
    const y = d.getFullYear()
    const m = d.getMonth()+1
    const dd= d.getDate()
    const w = ['日','月','火','水','木','金','土'][d.getDay()]
    return `${y}/${String(m).padStart(2,'0')}/${String(dd).padStart(2,'0')} (${w})`
  }
  const qs = new URLSearchParams(location.search)
  const token = qs.get('token')

  if(!token){
    statusEl.textContent = 'トークンがありません（URL を確認してください）'
    return
  }

  function buildTimeSlot(row){
    const radios = row.querySelectorAll('input[type="radio"]')
    const type = [...radios].find(r=>r.checked)?.value || 'x'
    if(type==='x') return 'x'
    if(type==='am') return 'am'
    if(type==='pm') return 'pm'
    if(type==='allday') return 'allday'
    if(type==='range'){
      const start = row.querySelector('.startSel').value
      const end = row.querySelector('.endSel').value
      if(!start || !end) return ''
      if(end <= start){
        throw new Error('終了時刻は開始より後を選択してください')
      }
      return `time:${start}-${end}`
    }
    return ''
  }

  function hourOptions(){
    const arr = []
    for(let h=1; h<=24; h++){
      const lab = String(h).padStart(2,'0') + ':00'
      arr.push(lab)
    }
    return arr
  }

  function renderAllowed(dates){
    const hours = hourOptions()
    const sorted = [...dates].sort((a,b)=> new Date(a) - new Date(b))
    allowedBody.innerHTML = sorted.map(d=>{
      const id = 'r_'+d.replaceAll('-','')
      return `
        <tr data-date="${d}">
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
              <select class="startSel" disabled>
                ${hours.map(h=>`<option value="${h}">${h}</option>`).join('')}
              </select>
              〜
              <select class="endSel" disabled>
                ${hours.map(h=>`<option value="${h}">${h}</option>`).join('')}
              </select>
            </div>
          </td>
          <td>
            <input type="checkbox" class="pick" aria-label="この日を登録対象にする">
          </td>
        </tr>
      `
    }).join('')

    for(const tr of allowedBody.querySelectorAll('tr')){
      const id = 'r_'+tr.dataset.date.replaceAll('-','')
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
    }
  }

  function renderRegs(list){
    const nameFilter = (filterNameEl.value||'').trim()
    const filtered = nameFilter ? list.filter(it => (it.member_name||'').includes(nameFilter)) : list
    const sorted = [...filtered].sort((a,b)=> {
      const da = new Date(a.date), db = new Date(b.date)
      if(da - db !== 0) return da - db
      return (a.member_name||'').localeCompare(b.member_name||'')
    })
    let html = '<table class="table"><thead><tr><th>日付</th><th>時間</th><th>名前</th><th>メモ</th><th></th></tr></thead><tbody>'
    for(const it of sorted){
      const chip = chipFromTime(it.time_slot)
      html += `<tr data-id="${it.id}">
        <td><span class="reg-badge">${fmtJP(it.date)}</span></td>
        <td>${chip}</td>
        <td>${escapeHtml(it.member_name||'')}</td>
        <td>${it.memo?escapeHtml(it.memo):''}</td>
        <td></td>
      </tr>`
    }
    html += '</tbody></table>'
    regsWrap.innerHTML = html
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

  let allowedDates = []
  let regs = []

  async function loadAll(){
    const r1 = await fetch(`/api/shared/session/${encodeURIComponent(token)}`)
    if(!r1.ok){ statusEl.textContent='セッションの取得に失敗しました'; return }
    const s = await r1.json()
    titleEl.textContent = s.title || '共有スケジュール'
    allowedDates = Array.isArray(s.allowed_dates) ? s.allowed_dates : []
    if(allowedDates.length===0){
      statusEl.textContent='候補日がありません。共有設定から候補日を追加してください。'
    }
    renderAllowed(allowedDates)

    const r2 = await fetch(`/api/shared/session/${encodeURIComponent(token)}/events`)
    regs = r2.ok ? await r2.json() : []
    renderRegs(regs)
  }

  registerBtn.addEventListener('click', async ()=>{
    try{
      statusEl.textContent = ''
      const name = (nameEl.value||'').trim()
      if(!name){ statusEl.textContent='名前を入力してください'; return }
      const picks = []
      for(const tr of allowedBody.querySelectorAll('tr')){
        const picked = tr.querySelector('.pick')?.checked
        if(!picked) continue
        const date = tr.dataset.date
        const time_slot = buildTimeSlot(tr)
        if(!time_slot){ throw new Error('時間指定が未設定の行があります') }
        picks.push({ date, time_slot })
      }
      if(picks.length===0){ statusEl.textContent='少なくとも1日選択してください'; return }

      for(const p of picks){
        const r = await fetch(`/api/shared/session/${encodeURIComponent(token)}/register`, {
          method:'POST',
          headers:{'content-type':'application/json'},
          body: JSON.stringify({ date: p.date, time_slot: p.time_slot, member_name: name, memo: (memoEl.value||null) })
        })
        if(!r.ok){
          const t = await r.text()
          throw new Error('登録に失敗しました: '+t)
        }
      }
      statusEl.textContent = '登録しました'
      await reloadRegs()
    }catch(e){
      console.error(e)
      statusEl.textContent = e.message || '登録に失敗しました'
    }
  })

  async function reloadRegs(){
    const r = await fetch(`/api/shared/session/${encodeURIComponent(token)}/events`)
    regs = r.ok ? await r.json() : []
    renderRegs(regs)
  }

  filterNameEl.addEventListener('input', ()=>renderRegs(regs))

  loadAll().catch(err=>{
    console.error(err)
    statusEl.textContent='初期化中にエラーが発生しました'
  })
})();