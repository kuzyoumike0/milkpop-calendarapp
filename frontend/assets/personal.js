import { Calendar } from './calendar.js'

let userId = null
const nameInput = document.querySelector('#personName')
const btnLoad = document.querySelector('#loadOrCreate')
const info = document.querySelector('#userInfo')


const hourStart = Array.from({length:24},(_,h)=>`${String(h).padStart(2,'0')}:00`)
const hourEnd   = Array.from({length:25},(_,h)=>`${String(h).padStart(2,'0')}:00`)

const calEl = document.querySelector('#pcal').parentElement
const cal = Calendar(calEl, { mode:'multi' })
let mode='multi'
document.querySelector('#pmMulti').onchange = ()=>{ if(document.querySelector('#pmMulti').checked){ mode='multi'; cal.setMode('multi') } }
document.querySelector('#pmRange').onchange = ()=>{ if(document.querySelector('#pmRange').checked){ mode='range'; cal.setMode('range') } }

// type toggles
const ptBlock = document.querySelector('#ptBlock')
const ptTime = document.querySelector('#ptTime')
const pBlock = document.querySelector('#pBlock')
const pStart = document.querySelector('#pStart')
const pEnd = document.querySelector('#pEnd')
const pSep = document.querySelector('#pSep')
const pTitle = document.querySelector('#pTitle')
const pErr = document.querySelector('#pErr')
const pList = document.querySelector('#pList')

const times = Array.from({length:48}, (_,i)=>{
  const h = String(Math.floor(i/2)).padStart(2,'0')
  const m = i%2===0 ? '00':'30'
  return `${h}:${m}`
})
times.forEach(t=>{ const o1=document.createElement('option');o1.value=t;o1.textContent=t;pStart.appendChild(o1)
                   const o2=document.createElement('option');o2.value=t;o2.textContent=t;pEnd.appendChild(o2)})
pStart.value='09:00'; pEnd.value='18:00'

function syncType(){
  const isTime = ptTime.checked
  pBlock.style.display = isTime ? 'none':''
  pStart.style.display = isTime ? '':'none'
  pEnd.style.display   = isTime ? '':'none'
  pSep.style.display   = isTime ? '':'none'
}
ptBlock.onchange = syncType; ptTime.onchange = syncType; syncType()

btnLoad.onclick = async ()=>{
  const name = (nameInput.value||'').trim()
  if(!name){ pErr.textContent='ユーザー名を入力してください'; return }
  const r = await fetch('/api/users/upsert',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name }) })
  if(!r.ok){ pErr.textContent='ユーザー作成に失敗'; return }
  const d = await r.json(); userId = d.user_id; info.textContent = `user_id = ${userId}`
  pErr.textContent=''; await loadEvents()
}

async function loadEvents(){
  if(!userId) return
  const r = await fetch('/api/personal?user_id='+userId)
  if(!r.ok) return
  const arr = await r.json()
  pList.innerHTML=''
  arr.forEach(it=>{
    const li = document.createElement('li')
    li.className='item'
    li.innerHTML = `<span class="small" style="width:110px">${it.date}</span><span class="chip time">${it.time_slot}</span><span style="flex:1">${it.title||''}</span><button class="link del">削除</button>`
    li.querySelector('.del').onclick = async ()=>{
      await fetch('/api/personal/'+it.id,{ method:'DELETE' })
      await loadEvents()
    }
    pList.appendChild(li)
  })
}

document.querySelector('#pSubmit').onclick = async ()=>{
  if(!userId){ pErr.textContent='先にユーザー名を読み込み/作成してください'; return }
  const dates = cal.getSelected()
  if(dates.length===0){ pErr.textContent='日付を選択してください'; return }
  pErr.textContent=''

  const items = []
  if(ptTime.checked){
    if(pStart.value >= pEnd.value){ pErr.textContent='終了は開始より後にしてください'; return }
    dates.forEach(d=> items.push({ date:d, time_slot: `${pStart.value}-${pEnd.value}`, title: pTitle.value||'' }))
  }else{
    const b = pBlock.value
    dates.forEach(d=> items.push({ date:d, time_slot: b, title: pTitle.value||'' }))
  }

  const r = await fetch('/api/personal',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id: userId, items }) })
  if(!r.ok){ pErr.textContent='登録に失敗しました'; return }
  await loadEvents()
  alert('登録しました')
}
