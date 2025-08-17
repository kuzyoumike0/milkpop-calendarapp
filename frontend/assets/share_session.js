
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
    memberNameEl.addEventListener('input', refreshSubmit)

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

      listEl.innerHTML = `<table>
        <thead><tr><th>日付</th><th>時間</th><th>選択</th></tr></thead>
        <tbody></tbody>
      </table>`
      rows = []
      allowed.forEach(buildRow)
      refreshSubmit()
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
      statusEl.textContent='登録しました！'
    }catch(e){
      console.error(e); statusEl.textContent='登録に失敗しました: '+(e.message||'')
    }
  })
})()
