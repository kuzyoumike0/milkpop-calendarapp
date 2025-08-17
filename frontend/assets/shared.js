// frontend/assets/shared.js
(function(){
  const $ = (id)=>document.getElementById(id)
  const calEl = $('calendar')
  const shareUrlEl = $('shareUrl')
  const btnCreate = $('btnCreate')
  const titleEl = $('title')

  let mode = 'multi'
  let picked = []
  const radios = [...document.querySelectorAll('input[name=selmode]')]
  radios.forEach(r=>r.addEventListener('change', ()=>{
    mode = radios.find(x=>x.checked).value
    picked = []
    cal.renderMonth(new Date())
    shareUrlEl.textContent=''
  }))

  const jst = (d)=>{
    const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), da=String(d.getDate()).padStart(2,'0')
    return `${y}-${m}-${da}`
  }

  const cal = new window.MilkCal.Calendar(calEl, {
    onPick: (dateObj)=>{
      const s=jst(dateObj)
      if(mode==='multi'){
        picked = picked.includes(s) ? picked.filter(x=>x!==s) : [...picked, s]
      }else{
        if(picked.length===0){ picked=[s] }
        else if(picked.length===1){
          const a=new Date(picked[0]); const b=dateObj
          const sDay=new Date(Math.min(a,b)); const eDay=new Date(Math.max(a,b))
          const arr=[]
          for(let t=new Date(sDay); t<=eDay; t.setDate(t.getDate()+1)){ arr.push(jst(new Date(t))) }
          picked = arr
        }else{ picked=[s] }
      }
      shareUrlEl.textContent = picked.length ? `選択: ${picked.join(', ')}` : ''
      cal.highlight(d=> picked.includes(jst(d)))
    }
  })
  cal.renderMonth(new Date())

  
  // Personal-like controls on shared page (UI only)
  const slabel = document.getElementById('slabelSel')
  const sstart = document.getElementById('sstartSel')
  const send = document.getElementById('sendSel')
  const skinds = document.querySelectorAll('input[name=skind]')

  if (sstart && send) {
    sstart.innerHTML=''; send.innerHTML=''
    for(let h=1;h<=23;h++){ const v=String(h).padStart(2,'0')+':00'; const o=document.createElement('option');o.value=v;o.textContent=v;sstart.appendChild(o) }
    for(let h=1;h<=23;h++){ const v=String(h).padStart(2,'0')+':00'; const o=document.createElement('option');o.value=v;o.textContent=v;send.appendChild(o) }
    const zero=document.createElement('option'); zero.value='00:00'; zero.textContent='00:00'; send.appendChild(zero)
  }
  if (skinds.length){
    const upd=()=>{ const timeMode = document.querySelector('input[name=skind]:checked').value==='time'; if(sstart&&send){ sstart.disabled=send.disabled=!timeMode } if(slabel){ slabel.disabled=timeMode } }
    skinds.forEach(r=>r.addEventListener('change', upd)); upd()
  }
btnCreate.addEventListener('click', async ()=>{
    if(picked.length===0){ shareUrlEl.textContent='日付を選んでください'; return }
    try{
      const r = await fetch('/api/shared/session', {
        method:'POST', headers:{'content-type':'application/json'},
        body: JSON.stringify({ dates:picked, mode, title:titleEl.value||'' })
      })
      if(!r.ok) throw new Error('create_failed')
      const data = await r.json()
      shareUrlEl.innerHTML = `共有URL: <a href="${data.url}" target="_blank" rel="noopener noreferrer">${data.url}</a>`
    }catch(e){
      console.error(e); shareUrlEl.textContent='リンクの発行に失敗しました'
    }
  })
})()
