// frontend/assets/personal.js
(function(){
  const $ = (id)=>document.getElementById(id)
  const calEl = $('calendar')
  const titleEl = $('ptitle')
  const labelSel = $('plabelSel')
  const startSel = $('pstartSel')
  const endSel = $('pendSel')
  const btn = $('psave')
  const statusEl = $('pstatus')

  const fillTime = ()=>{
    startSel.innerHTML=''; endSel.innerHTML=''
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

  let picked = null
  function jst(d){ const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), da=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${da}` }

  document.querySelectorAll('input[name=pkind]').forEach(r=>{
    r.addEventListener('change', ()=>{
      const mode = document.querySelector('input[name=pkind]:checked').value
      const timeMode = mode==='time'
      startSel.disabled = endSel.disabled = !timeMode
      labelSel.disabled = timeMode
    })
  })

  const cal = new window.MilkCal.Calendar(calEl, {
    onPick: (date)=>{
      picked = jst(date)
      cal.highlight(d=> jst(d)===picked)
      btn.disabled = false
    }
  })
  cal.renderMonth(new Date())

  btn.addEventListener('click', async ()=>{
    if(!picked){ statusEl.textContent='日付を選択してください'; return }
    const mode = document.querySelector('input[name=pkind]:checked').value
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
    const title = titleEl.value || ''
    try{
      const r = await fetch('/api/personal', {
        method:'POST', headers:{'content-type':'application/json'},
        body: JSON.stringify({ user_id: 1, date: picked, time_slot, title })
      })
      if(!r.ok) throw new Error('save_failed')
      statusEl.textContent='登録しました！'
    }catch(e){
      console.error(e); statusEl.textContent='登録に失敗しました'
    }
  })
})()
