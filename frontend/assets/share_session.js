
// frontend/assets/share_session.js (list-based UI)
(function(){
  const params = new URLSearchParams(location.search)
  const token = params.get('token')
  const $ = (id)=>document.getElementById(id)
  const statusEl = $('status')
  const titleEl = $('shareTitle')
  const listEl = $('datesList')
  const btn = $('btnSubmit')
  const memberNameEl = $('memberName')

  const hhOptions = (()=>{
    const s=[], e=[]
    for(let h=1;h<=23;h++){
      const v = String(h).padStart(2,'0')+':00'
      s.push(v); e.push(v)
    }
    e.push('00:00') // 24:00 相当
    return {s,e}
  })()

  let rows = [] // {date, typeEl, startEl, endEl, checkEl}
  let allowed = []

  function renderAllowed(){
    listEl.innerHTML = `<table>
        <thead><tr><th>日付</th><th>時間</th><th>選択</th></tr></thead>
        <tbody></tbody>
      </table>`
    rows = []
    allowed.forEach(buildRow)
    refreshSubmit()
  }

  function jst(dateStr){
    // already YYYY-MM-DD from server; format display JP
    const [y,m,d]=dateStr.split('-')
    return `${Number(y)}年${Number(m)}月${Number(d)}日`
  }

  function canSubmit(){
    if(!memberNameEl.value.trim()) return false
    return rows.some(r => r.checkEl.checked && (r.typeEl.value!=='time' || r.startEl.value!==''))
  }

  function refreshSubmit(){
    btn.disabled = !canSubmit()
  }

  function buildRow(date){
    const tr = document.createElement('tr')
    const tdDate = document.createElement('td')
    tdDate.innerHTML = `<span class="badge-date">${jst(date)}</span>`
    const tdKind = document.createElement('td')
    const tdTime = document.createElement('td')
    const tdCheck = document.createElement('td')

    const typeSel = document.createElement('select')
    typeSel.className = 'compact-select'
    ;['×','午前','午後','終日','時間指定'].forEach(label=>{
      const o = document.createElement('option')
      o.value = (label==='時間指定'?'time':label); o.textContent = label; typeSel.appendChild(o)
    })
    const startSel = document.createElement('select')
    const endSel = document.createElement('select')
    startSel.className = endSel.className = 'compact-select'
    startSel.disabled = endSel.disabled = true
    startSel.innerHTML = hhOptions.s.map(v=>`<option>${v}</option>`).join('')
    endSel.innerHTML = hhOptions.e.map(v=>`<option>${v}</option>`).join('')

    typeSel.addEventListener('change', ()=>{
      const isTime = typeSel.value==='time'
      startSel.disabled = endSel.disabled = !isTime
      refreshSubmit()
    })

    const wrap = document.createElement('div')
    wrap.className='compact-row'
    wrap.appendChild(typeSel)
    wrap.append(' ')
    wrap.appendChild(startSel)
    wrap.append('〜')
    wrap.appendChild(endSel)

    const check = document.createElement('input')
    check.type='checkbox'
    check.addEventListener('change', refreshSubmit)
    memberNameEl.addEventListener('input', ()=>{refreshSubmit(); renderRegistered();})

    tdKind.appendChild(wrap)
    tdTime.textContent = '' // kept for spacing
    tdCheck.appendChild(check)

    tr.append(tdDate, tdKind, tdCheck)
    listEl.querySelector('tbody').appendChild(tr)

    rows.push({date, typeEl:typeSel, startEl:startSel, endEl:endSel, checkEl:check})
  }

  async function boot(){
    if(!token){ statusEl.textContent='トークンがありません'; return }
    try{
      const r = await fetch('/api/shared/session/'+token)
      if(!r.ok) throw new Error('session_not_found')
      const data = await r.json()
      titleEl.textContent = data.title || '共有スケジュール'
      allowed = data.allowed_dates||[]

      renderAllowed()
    }catch(e){
      console.error(e); statusEl.textContent='共有情報の取得に失敗しました'
    }
  }
  boot()

  function parseMin(hhmm){
    const [hh,mm] = hhmm.split(':').map(Number)
    if(hh===0 && mm===0) return 24*60
    return hh*60+mm
  }

  btn.addEventListener('click', async ()=>{
    const name = memberNameEl.value.trim()
    if(!name){ statusEl.textContent='お名前を入力してください'; return }
    const selected = rows.filter(r=>r.checkEl.checked)
    if(selected.length===0){ statusEl.textContent='日付を選択してください'; return }

    try{
      for(const r of selected){
        let time_slot = ''
        if(r.typeEl.value==='time'){
          const s = r.startEl.value, e = r.endEl.value
          if(parseMin(s) >= parseMin(e)){
            statusEl.textContent = `${r.date}: 終了は開始より後にしてください`; return
          }
          time_slot = `${s}-${e}`
        }else{
          time_slot = r.typeEl.value
        }
        const res = await fetch('/api/shared/session/'+token+'/register', {
          method:'POST', headers:{'content-type':'application/json'},
          body: JSON.stringify({ date: r.date, time_slot, member_name: name })
        })
        if(!res.ok){
          const t = await res.text()
          throw new Error('register_failed: '+t)
        }
      }
      statusEl.textContent='登録しました！'; await fetchRegistered()
    }catch(e){
      console.error(e); statusEl.textContent='登録に失敗しました: '+(e.message||'')
    }
  })
})()



// Registered list + filter
const regListEl = document.getElementById('regList')
const filterNameEl = document.getElementById('filterName')
const filterSlotEl = document.getElementById('filterSlot')
const filterClearBtn = document.getElementById('filterClear')
let regAll = []


function renderRegistered(){
  const nameQ = (filterNameEl.value||'').trim().toLowerCase()
  const slotQ = filterSlotEl.value
  const meName = (memberNameEl.value||'').trim().toLowerCase()

  // filter
  const items = regAll.filter(it=>{
    const okName = !nameQ || (it.member_name||'').toLowerCase().includes(nameQ)
    const slot = (it.time_slot||'')
    const slotKind = (slot.includes('-')?'time':slot)
    const okSlot = !slotQ || slotKind===slotQ
    return okName && okSlot
  })

  // group by date
  const byDate = {}
  for(const it of items){
    (byDate[it.date] ||= []).push(it)
  }
  const dates = Object.keys(byDate).sort()

  if(items.length===0){
    regListEl.innerHTML = '<div class="muted">まだ登録がありません</div>'
    return
  }

  // summary bar
  const fmt = d => { const [y,m,dd]=d.split('-'); return `${Number(y)}年${Number(m)}月${Number(dd)}日` }
  let html = '<div class="summary-bar">'
  html += dates.map(d=>`<div class="summary-chip"><span>${fmt(d)}</span><span class="count">${byDate[d].length}</span></div>`).join('')
  html += '</div>'

  // table
  html += '<table><thead><tr><th>日付</th><th>時間</th><th>名前</th><th></th></tr></thead><tbody>'
  for(const d of dates){
    for(const it of byDate[d]){
      const disp = fmt(it.date)
      const slot = (it.time_slot||'')
      const chip = slot.includes('-')
        ? `<span class="time-chip">${slot}</span>`
        : `<span class="slot-chip">${slot||'×'}</span>`
      const me = meName && (it.member_name||'').toLowerCase()===meName
      html += `<tr data-id="${it.id}" class="${me?'me-row':''}"><td><span class="reg-badge">${disp}</span></td><td>${chip}</td><td>${it.member_name||''}</td><td>${me?'<button class="danger sm" data-id="'+it.id+'">削除</button>':''}</td></tr>`
    }
  }
  html += '</tbody></table>'
  regListEl.innerHTML = html
}
)
  if(items.length===0){
    regListEl.innerHTML = '<div class="muted">まだ登録がありません</div>'
    return
  }
  let html = '<table><thead><tr><th>日付</th><th>時間</th><th>名前</th><th></th></tr></thead><tbody>'
  html += items.map(it=>{
    const j = it.date // YYYY-MM-DD
    const disp = (d=>{const [y,m,dd]=d.split('-'); return `${Number(y)}年${Number(m)}月${Number(dd)}日`})(j)
    const slot = (it.time_slot||'')
    const chip = slot.includes('-')
      ? `<span class="time-chip">${slot}</span>`
      : `<span class="slot-chip">${slot||'×'}</span>`
    return `<tr data-id="${it.id}"><td><span class=\"reg-badge\">${disp}</span></td><td>${chip}</td><td>${it.member_name||''}</td><td><button class=\"danger sm\" data-id=\"${it.id}\">削除</button></td></tr>`
  }).join('')
  html += '</tbody></table>'
  regListEl.innerHTML = html
}

async function fetchRegistered(){
  try{
    const r = await fetch('/api/shared/session/'+token+'/events')
    if(!r.ok) throw new Error('fetch_events_failed')
    regAll = await r.json()
    renderRegistered()
  }catch(e){
    console.error(e); regListEl.innerHTML = '<div class="muted">取得に失敗しました</div>'
  }
}

filterNameEl && filterNameEl.addEventListener('input', renderRegistered)
filterSlotEl && filterSlotEl.addEventListener('change', renderRegistered)
filterClearBtn && filterClearBtn.addEventListener('click', ()=>{
  filterNameEl.value=''; filterSlotEl.value=''; renderRegistered()
})

// After boot, also fetch registered
(function(orig){
  boot = async function(){ await orig(); await fetchRegistered() }
})(boot)

