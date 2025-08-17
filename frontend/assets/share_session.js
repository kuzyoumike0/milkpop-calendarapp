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
    const type = row.querySelector('input[type="radio"]:checked')?.value || 'x'
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
    allowedBody.innerHTML = dates.map(d=>{
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

    // 時間指定選択時だけ select を有効化
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
    list = [...list].sort((a,b)=> new Date(a.date)-new Date(b.date) || String(a.member_name||'').localeCompare(String(b.member_name||'')))

    const nameFilter = (filterNameEl.value||'').trim()
    const filtered = nameFilter ? list.filter(it => (it.member_name||'').includes(nameFilter)) : list
    let html = '<table class="table"><thead><tr><th>日付</th><th>時間</th><th>名前</th><th>メモ</th><th></th></tr></thead><tbody>'
    for(const it of filtered){
      const chip = chipFromTime(it.time_slot)
      const me = (nameEl.value && it.member_name === nameEl.value)
      html += `<tr data-id="${it.id}" class="${me?'me-row':''}">
        <td><span class="reg-badge">${fmtJP(it.date)}</span></td>
        <td>${chip}</td>
        <td>${it.member_name||''}</td>
        <td>${it.memo?escapeHtml(it.memo):''}</td>
        <td>${me?`<div class="row" style="gap:6px">
            <button class="ghost sm edit" data-id="${it.id}">変更</button>
            <button class="danger sm del" data-id="${it.id}">削除</button>
          </div>`:''}</td>
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
    renderAllowed([...allowedDates].sort((a,b)=> new Date(a)-new Date(b)))

    const r2 = await fetch(`/api/shared/session/${encodeURIComponent(token)}/events`)
    if(r2.ok){
      regs = await r2.json()
      renderRegs(regs)
    } else {
      regs = []
      renderRegs(regs)
    }
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
    if(r.ok){
      regs = await r.json()
      renderRegs(regs)
    }
  }

  regsWrap.addEventListener('click', async (ev)=>{
    const delBtn = ev.target.closest('button.del')
    const editBtn = ev.target.closest('button.edit')
    if(!delBtn && !editBtn) return
    const id = (delBtn||editBtn).getAttribute('data-id')
    const my = (nameEl.value||'').trim()
    if(!my){ statusEl.textContent='名前を入力してください'; return }

    if(delBtn){
      if(!confirm('この登録を削除しますか？')) return
      const r = await fetch(`/api/shared/session/${encodeURIComponent(token)}/events/${id}`, {
        method:'DELETE',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({ member_name: my })
      })
      if(!r.ok){ statusEl.textContent='削除に失敗しました'; return }
      await reloadRegs()
      return
    }

    if(editBtn){
      const tr = editBtn.closest('tr')
      const tdTime = tr.children[1]
      const tdMemo = tr.children[3]
      const tdAct  = tr.children[4]
      const oldT = tdTime.innerHTML
      const oldM = tdMemo.innerHTML
      const oldA = tdAct.innerHTML

      const hours = (function(){const a=[];for(let h=1;h<=24;h++)a.push(String(h).padStart(2,'0')+':00');return a})()
      const wrap = document.createElement('div')
      wrap.className='compact-row'
      wrap.style.gap='6px'
      wrap.innerHTML = `
        <label><input type="radio" name="editType-${id}" value="x"> ×</label>
        <label><input type="radio" name="editType-${id}" value="am"> 午前</label>
        <label><input type="radio" name="editType-${id}" value="pm"> 午後</label>
        <label><input type="radio" name="editType-${id}" value="allday"> 終日</label>
        <label><input type="radio" name="editType-${id}" value="range"> 時間指定</label>
        <select class="startSel" disabled>
          ${hours.map(h=>`<option value="${h}">${h}</option>`).join('')}
        </select>〜
        <select class="endSel" disabled>
          ${hours.map(h=>`<option value="${h}">${h}</option>`).join('')}
        </select>
      `
      const typeRadios = wrap.querySelectorAll(`input[name="editType-${id}"]`)
      const startSel = wrap.querySelector('.startSel')
      const endSel = wrap.querySelector('.endSel')

      ;[...typeRadios].forEach(r=>{ if(tdTime.textContent.includes(r.nextSibling.textContent||r.value)) r.checked=true })
      const refresh = ()=>{
        const v = [...typeRadios].find(r=>r.checked)?.value
        const on = (v==='range')
        startSel.disabled = !on
        endSel.disabled   = !on
      }
      typeRadios.forEach(r=>r.addEventListener('change', refresh))
      refresh()

      const memoIn = document.createElement('input')
      memoIn.className='w100 fancy'
      memoIn.placeholder='メモ（任意）'
      memoIn.value = tdMemo.textContent.trim()

      const act = document.createElement('div')
      act.className='compact-row'
      act.style.gap='6px'
      act.innerHTML = `<button class="primary sm save">保存</button><button class="ghost sm cancel">キャンセル</button>`

      tdTime.innerHTML = ''
      tdTime.appendChild(wrap)
      tdMemo.innerHTML = ''
      tdMemo.appendChild(memoIn)
      tdAct.innerHTML = ''
      tdAct.appendChild(act)

      act.querySelector('.cancel').addEventListener('click', ()=>{
        tdTime.innerHTML = oldT; tdMemo.innerHTML = oldM; tdAct.innerHTML = oldA
      })
      act.querySelector('.save').addEventListener('click', async ()=>{
        const v = [...typeRadios].find(r=>r.checked)?.value || 'x'
        let time_slot = 'x'
        if(v==='am') time_slot='am'
        else if(v==='pm') time_slot='pm'
        else if(v==='allday') time_slot='allday'
        else if(v==='range'){
          if(endSel.value <= startSel.value){ alert('終了時刻は開始より後を選択してください'); return }
          time_slot = `time:${startSel.value}-${endSel.value}`
        }
        const r = await fetch(`/api/shared/session/${encodeURIComponent(token)}/events/${id}`, {
          method:'PUT',
          headers:{'content-type':'application/json'},
          body: JSON.stringify({ member_name: my, time_slot, memo: memoIn.value||null })
        })
        if(!r.ok){ alert('更新に失敗しました'); return }
        await reloadRegs()
      })
    }
  })

  filterNameEl.addEventListener('input', ()=>renderRegs(regs))

  loadAll().catch(err=>{
    console.error(err)
    statusEl.textContent='初期化中にエラーが発生しました'
  })
})();