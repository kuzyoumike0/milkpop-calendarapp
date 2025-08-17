import { Calendar } from './calendar.js'

const calEl   = document.getElementById('calendar')
const listEl  = document.getElementById('list')
const statusEl= document.getElementById('status')
const titleEl = document.getElementById('title')

const uidEl   = document.getElementById('uid')
document.getElementById('btnLoad').addEventListener('click', loadList)

const blockBox = document.getElementById('blockBox')
const timeBox  = document.getElementById('timeBox')
const blockSelect = document.getElementById('blockSelect')
const startSelect = document.getElementById('startSelect')
const endSelect   = document.getElementById('endSelect')

const hourStart = Array.from({length:23},(_,i)=>`${String(i+1).padStart(2,'0')}:00`)
const hourEnd   = [...Array.from({length:23},(_,i)=>`${String(i+1).padStart(2,'0')}:00`), '00:00']

function fillTimeSelects(){
  startSelect.innerHTML = ''; endSelect.innerHTML=''
  hourStart.forEach(h=>{ const o=document.createElement('option'); o.value=h; o.textContent=h; startSelect.appendChild(o) })
  hourEnd.forEach(h=>{ const o=document.createElement('option'); o.value=h; o.textContent=h; endSelect.appendChild(o) })
}
fillTimeSelects()

function parseMinutes(hhmm){
  const [hh,mm] = hhmm.split(':').map(Number)
  if(hh===0 && mm===0) return 24*60; // 00:00 as end-of-day
  return hh*60+mm
}

const radios = [...document.querySelectorAll('input[name=mode]')]
function refreshMode(){
  const v = radios.find(r=>r.checked).value
  blockBox.classList.toggle('hide', v!=='block')
  timeBox.classList.toggle('hide', v!=='time')
}
radios.forEach(r=>r.addEventListener('change', refreshMode))
refreshMode()

let selectedDate = null
const cal = new Calendar(calEl, {
  onPick: (d)=>{
    selectedDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    statusEl.textContent = `選択中: ${selectedDate}`
  }
})
cal.renderMonth(new Date())

async function loadList(){
  const uid = Number(uidEl.value||'1')
  const r = await fetch(`/api/personal/${uid}`)
  const arr = r.ok ? await r.json() : []
  listEl.innerHTML = ''
  for(const it of arr){
    const li = document.createElement('li')
    li.textContent = `${it.date} / ${it.time_slot} ${it.title?`- ${it.title}`:''}`
    listEl.appendChild(li)
  }
}
loadList()

document.getElementById('btnAdd').addEventListener('click', async ()=>{
  const uid = Number(uidEl.value||'1')
  if(!selectedDate){ statusEl.textContent='日付を選んでください'; return }
  const mode = radios.find(r=>r.checked).value
  let time_slot = '×'
  if(mode==='block'){
    time_slot = blockSelect.value
  }else if(mode==='time'){
    const s = startSelect.value, e = endSelect.value
    if(parseMinutes(s) >= parseMinutes(e)){
  statusEl && (statusEl.textContent='終了は開始より後にしてください');
  return;
}
    time_slot = `${s}-${e}`
  }
  const r = await fetch('/api/personal', {
    method:'POST', headers:{'content-type':'application/json'},
    body: JSON.stringify({ user_id: uid, date: selectedDate, time_slot, title: titleEl.value||'' })
  })
  if(!r.ok){ statusEl.textContent='登録に失敗しました'; return }
  statusEl.textContent='登録しました'
  titleEl.value=''
  await loadList()
})
