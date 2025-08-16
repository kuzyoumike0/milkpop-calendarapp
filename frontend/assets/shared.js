import { Calendar } from './calendar.js'

const calEl = document.querySelector('#calendar').parentElement
const cal = Calendar(calEl, { mode:'multi' })
let mode = 'multi'
document.querySelector('#btnMulti').onclick = ()=>{ mode='multi'; cal.setMode('multi'); toggleActive() }
document.querySelector('#btnRange').onclick = ()=>{ mode='range'; cal.setMode('range'); toggleActive() }
function toggleActive(){
  document.querySelector('#btnMulti').classList.toggle('active', mode==='multi')
  document.querySelector('#btnRange').classList.toggle('active', mode==='range')
}

async function fetchShared(){
  const r = await fetch('/api/shared')
  const list = document.querySelector('#sharedList')
  list.innerHTML = ''
  if(!r.ok) return
  const data = await r.json()
  data.forEach(it=>{
    const li = document.createElement('li')
    li.className='item'
    li.innerHTML = `<span class="chip time">🕒 ${it.time_slot}</span><span class="chip user">👤 ${it.member_name||'—'}</span><span class="small" style="width:110px">${it.date||''}</span><span style="flex:1">${it.title||''}</span><button class="link del">削除</button>`
    li.querySelector('.del').onclick = async ()=>{
      if(!confirm('削除しますか？')) return
      await fetch('/api/shared/'+it.id, { method:'DELETE' })
      fetchShared()
    }
    list.appendChild(li)
  })
}
fetchShared()

document.querySelector('#btnCreate').onclick = async ()=>{
  const dates = cal.getSelected()
  if(!dates.length){ alert('日付を選択してください'); return }
  const title = document.querySelector('#title').value || ''
  const r = await fetch('/api/shared/session', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ dates, mode, title })})
  if(!r.ok){ alert('作成に失敗'); return }
  const d = await r.json()
  const out = document.querySelector('#linkOut')
  out.textContent = d.url
  try{ await navigator.clipboard.writeText(d.url); out.textContent += '（コピーしました）' }catch{}
}
