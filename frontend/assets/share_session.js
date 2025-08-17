// frontend/assets/share_session.js
(function(){
  const params = new URLSearchParams(location.search)
  const token = params.get('token')
  const $ = (id)=>document.getElementById(id)
  const statusEl = $('status')
  const titleEl = $('shareTitle')
  const calEl = $('calendar')
  const labelSel = $('labelSel')
  const startSel = $('startSel')
  const endSel = $('endSel')
  const btn = $('btnSubmit')

  const fillTime = ()=>{
    startSel.innerHTML=''; endSel.innerHTML=''
    // 開始 01:00..23:00, 終了 01:00..00:00(=24:00)
    for(let h=1;h<=23;h++){
      const v = String(h).padStart(2,'0')+':00'
      const o = document.createElement('option'); o.value=v; o.textContent=v; startSel.appendChild(o)
    }
    for(let h=1;h<=23;h++){
      const v = String(h).padStart(2,'0')+':00'
      const o = document.createElement('option'); o.value=v; o.textContent=v; endSel.appendChild(o)
    }
    const zero = document.createElement('option'); zero.value='00:00'; zero.textContent='00:00'; endSel.appendChild(zero)
  }
  fillTime()

  const parseMin = (hhmm)=>{
    const [hh,mm]=hhmm.split(':').map(Number)
    if(hh===0 && mm===0) return 24*60
    return hh*60+mm
  }

  let allowed = []
  let picked = null

  function jst(d){ const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), da=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${da}` }

  function enableBtn(){
    btn.disabled = !picked
  }

  async function boot(){
    if(!token){ statusEl.textContent='トークンがありません'; return }
    try{
      const r = await fetch('/api/shared/session/'+token)
      if(!r.ok) throw new Error('session_not_found')
      const data = await r.json()
      titleEl.textContent = data.title || '共有スケジュール'
      allowed = data.allowed_dates||[]
      const cal = new window.MilkCal.Calendar(calEl, {
        shouldEnable: (date)=> allowed.includes(jst(date)),
        onPick: (date)=>{
          const s=jst(date)
          picked = allowed.includes(s) ? s : null
          cal.highlight(d=> jst(d)===picked)
          enableBtn()
        }
      })
      cal.renderMonth(new Date())
      enableBtn()
    }catch(e){
      console.error(e); statusEl.textContent='共有情報の取得に失敗しました'
    }
  }
  boot()

  document.querySelectorAll('input[name=kind]').forEach(r=>{
    r.addEventListener('change', ()=>{
      const mode = document.querySelector('input[name=kind]:checked').value
      const timeMode = mode==='time'
      startSel.disabled = endSel.disabled = !timeMode
      labelSel.disabled = timeMode
    })
  })

  btn.addEventListener('click', async ()=>{
    if(!picked){ statusEl.textContent='日付を選択してください'; return }
    const mode = document.querySelector('input[name=kind]:checked').value
    let time_slot = ''
    if(mode==='label'){
      time_slot = labelSel.value
    }else{
      const s = startSel.value, e = endSel.value
      if(parseMin(s) >= parseMin(e)){
        statusEl.textContent='終了は開始より後にしてください'; return
      }
      time_slot = `${s}-${e}`
    }
    try{
      const r = await fetch('/api/shared/session/'+token+'/register', {
        method:'POST', headers:{'content-type':'application/json'},
        body: JSON.stringify({ date: picked, time_slot })
      })
      if(!r.ok) throw new Error('register_failed')
      statusEl.textContent='登録しました！'
    }catch(e){
      console.error(e); statusEl.textContent='登録に失敗しました'
    }
  })
})()
