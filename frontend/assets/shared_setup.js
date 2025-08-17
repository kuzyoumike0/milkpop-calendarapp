(function(){
  const titleEl = document.getElementById('title')
  const dEl = document.getElementById('d')
  const addBtn = document.getElementById('add')
  const listEl = document.getElementById('list')
  const issueBtn = document.getElementById('issue')
  const statusEl = document.getElementById('status')
  const outWrap = document.getElementById('result')
  const outEl = document.getElementById('out')
  const dates = []

  function render(){
    if(dates.length===0){ listEl.innerHTML = '<div class="muted">まだ候補日はありません</div>'; return }
    let html = '<ul class="spacey">'
    for(const dt of dates){
      html += `<li class="pill">${dt} <button class="danger sm" data-d="${dt}">削除</button></li>`
    }
    html += '</ul>'
    listEl.innerHTML = html
  }
  listEl.addEventListener('click', (ev)=>{
    const b = ev.target.closest('button.danger')
    if(!b) return
    const d = b.getAttribute('data-d')
    const i = dates.indexOf(d)
    if(i>=0){ dates.splice(i,1); render() }
  })

  addBtn.addEventListener('click', ()=>{
    const v = dEl.value
    if(!v){ statusEl.textContent='日付を選択してください'; return }
    if(!/^\d{4}-\d{2}-\d{2}$/.test(v)){ statusEl.textContent='形式が不正です'; return }
    if(!dates.includes(v)) dates.push(v)
    dEl.value=''
    render()
  })

  issueBtn.addEventListener('click', async ()=>{
    try{
      if(dates.length===0){ statusEl.textContent='候補日を1つ以上追加してください'; return }
      const body = { title: titleEl.value || '共有スケジュール', allowed_dates: dates }
      const r = await fetch('/api/shared/session', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) })
      if(!r.ok){ const t = await r.text(); throw new Error('issue_failed: '+t) }
      const data = await r.json()
      const url = data.url || (location.origin + '/share_session.html?token=' + data.token)
      outEl.value = url
      outWrap.style.display = 'block'
      statusEl.textContent = '共有リンクを発行しました'
    }catch(e){
      console.error(e); statusEl.textContent='発行に失敗しました: '+(e.message||'')
    }
  })

  render()
})()
