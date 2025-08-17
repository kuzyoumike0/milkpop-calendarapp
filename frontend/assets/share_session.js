import { Calendar } from './calendar.js'

const calEl = document.getElementById('calendar')
const listEl = document.getElementById('list')
const statusEl = document.getElementById('status')

const blockBox = document.getElementById('blockBox')
const timeBox  = document.getElementById('timeBox')
const blockSelect = document.getElementById('blockSelect')
const startSelect = document.getElementById('startSelect')
const endSelect   = document.getElementById('endSelect')

const hourStart = Array.from({length:23},(_,i)=>`${String(i+1).padStart(2,'0')}:00`)
const hourEnd   = [...Array.from({length:23},(_,i)=>`${String(i+1).padStart(2,'0')}:00`), '00:00']

function fillTimeSelects(){
  startSelect.innerHTML = ''
  endSelect.innerHTML = ''
  hourStart.forEach(h=>{ const o=document.createElement('option'); o.value=h; o.textContent=h; startSelect.appendChild(o) })
  hourEnd.forEach(h=>{ const o=document.createElement('option'); o.value=h; o.textContent=h; endSelect.appendChild(o) })
}
fillTimeSelects()

function parseMinutes(hhmm){
  const [hh,mm] = hhmm.split(':').map(Number)
  if(hh===0 && mm===0) return 24*60; // 00:00 as end-of-day
  return hh*60+mm
}

// mode radio display
const radios = [...document.querySelectorAll('input[name=mode]')]
function refreshMode(){
  const v = radios.find(r=>r.checked).value
  blockBox.classList.toggle('hide', v!=='block')
  timeBox.classList.toggle('hide', v!=='time')
}
radios.forEach(r=>r.addEventListener('change', refreshMode))
refreshMode()

// token & load session
const url = new URL(location.href)
const token = url.searchParams.get('token')
let allowed = []
let selectedDate = null

function jstDateStr(d){
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}

async function loadSession(){
  const r = await fetch(`/api/shared/session/${token}`)
  if(!r.ok){ statusEl.textContent = 'セッションが見つかりません'; return }
  const data = await r.json()
  allowed = data.allowed_dates || []
  // render calendar limited to allowed
  const cal = new Calendar(calEl, {
    onPick: (d)=>{
      const s = jstDateStr(d)
      if(!allowed.includes(s)){
        statusEl.textContent = 'この日は選択できません'; return
      }
      selectedDate = s
      statusEl.textContent = `選択中: ${s}`
    },
    shouldEnable: (d)=> allowed.includes(jstDateStr(d))
  })
  cal.renderMonth(new Date())
  renderList(data.existing || [])
}

function renderList(items){
  listEl.innerHTML = ''
  for(const it of items){
    const li = document.createElement('li')
    li.textContent = `${it.date} / ${it.time_slot} ${it.member_name?`(${it.member_name})`:''}`
    listEl.appendChild(li)
  }
}

document.getElementById('btnRegister').addEventListener('click', async ()=>{
  if(!selectedDate){ statusEl.textContent = '日付を選んでください'; return }
  const mode = radios.find(r=>r.checked).value
  let time_slot = '×'
  if(mode==='block'){
    time_slot = blockSelect.value // 午前/午後/終日
  }else if(mode==='time'){
    const s = startSelect.value, e = endSelect.value
    if(parseMinutes(s) >= parseMinutes(e)){
  statusEl && (statusEl.textContent='終了は開始より後にしてください');
  return;
}
    time_slot = `${s}-${e}`
  }
  const r = await fetch(`/api/shared/session/${token}/register`, {
    method:'POST', headers:{'content-type':'application/json'},
    body: JSON.stringify({ date: selectedDate, time_slot })
  })
  if(!r.ok){ statusEl.textContent = '登録に失敗しました'; return }
  statusEl.textContent = '登録しました'
  await loadSession()
})

loadSession()
