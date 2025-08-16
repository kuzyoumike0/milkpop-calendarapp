import { Calendar } from './calendar.js'

const params = new URLSearchParams(location.search)
const token = params.get('token') || ''

const calEl = document.querySelector('#calendar').parentElement
const cal = Calendar(calEl, { mode:'multi' })
let mode='multi'
document.querySelector('#btnMulti').onclick=()=>{mode='multi'; cal.setMode('multi'); toggle()}
document.querySelector('#btnRange').onclick=()=>{mode='range'; cal.setMode('range'); toggle()}
function toggle(){ 
  document.querySelector('#btnMulti').classList.toggle('active', mode==='multi')
  document.querySelector('#btnRange').classList.toggle('active', mode==='range')
  renderAnswers()
}

const hourOptions = Array.from({length:24}, (_,i)=> `${String(i).padStart(2,'0')}:00`)

let allowed = []
let title = ''
let perDate = {} // d => {type:'x'|'time', start:'HH:MM', end:'HH:MM'}

async function load(){
  if(!token){ document.querySelector('#err').textContent='トークンがありません'; return }
  const r = await fetch('/api/shared/session/'+token)
  if(!r.ok){ document.querySelector('#err').textContent='リンクが無効です'; return }
  const d = await r.json()
  allowed = d.allowed_dates || []
  title = d.title || ''
  // 初期値
  const init={}; allowed.forEach(dt=>{ init[dt] = { type:'time', start:'09:00', end:'18:00' } })
  perDate = init
  renderAnswers()
}
load()

function renderAnswers(){
  const list = document.querySelector('#answers')
  list.innerHTML=''
  const dates = cal.getSelected()
  dates.forEach(d=>{
    if(!allowed.includes(d)) return // guard
    const row = document.createElement('li')
    row.className='item'
    row.innerHTML = `<div style="width:120px;font-weight:700">${d}</div>
    <label style="display:flex;align-items:center;gap:6px"><input type="radio" name="t-${d}" ${perDate[d]?.type!=='x'?'checked':''} value="time"> 時間指定</label>
    <label style="display:flex;align-items:center;gap:6px"><input type="radio" name="t-${d}" ${perDate[d]?.type==='x'?'checked':''} value="x"> ×（不可）</label>
    <select class="select strong start"></select><span>〜</span><select class="select strong end"></select>`
    const selS = row.querySelector('.start')
    const selE = row.querySelector('.end')
    hourOptions.forEach(h=>{
      const oS=document.createElement('option'); oS.value=h; oS.textContent=h; selS.appendChild(oS)
      const oE=document.createElement('option'); oE.value=h; oE.textContent=h; selE.appendChild(oE)
    })
    selS.value = perDate[d]?.start || '09:00'
    selE.value = perDate[d]?.end || '18:00'

    const radios = row.querySelectorAll(`input[name="t-${d}"]`)
    radios.forEach(r=> r.onchange = ()=>{
      const v = r.value
      perDate[d] = perDate[d] || {}
      perDate[d].type = v
      row.querySelector('.start').disabled = (v==='x')
      row.querySelector('.end').disabled = (v==='x')
    })

    // initial disable
    row.querySelector('.start').disabled = ((perDate[d]?.type||'time')==='x')
    row.querySelector('.end').disabled = ((perDate[d]?.type||'time')==='x')

    // time validation
    function validate(){
      const s = row.querySelector('.start').value
      const e = row.querySelector('.end').value
      const err = document.querySelector('#err')
      if(((perDate[d]?.type)||'time')==='time'){
        if(s>=e){ err.textContent='終了時刻は開始時刻より後を選んでください'; return false }
      }
      err.textContent=''
      return true
    }
    selS.onchange = ()=>{ perDate[d].start = selS.value; validate() }
    selE.onchange = ()=>{ perDate[d].end = selE.value; validate() }

    list.appendChild(row)
  })
}

document.querySelector('#btnSubmit').onclick = async ()=>{
  const err = document.querySelector('#err')
  const dates = cal.getSelected()
  if(dates.length===0){ err.textContent='日付を選択してください'; return }
  // validate all
  for(const d of dates){
    if((perDate[d]?.type||'time')==='time'){
      const s = perDate[d]?.start || '09:00'
      const e = perDate[d]?.end || '18:00'
      if(s>=e){ err.textContent='終了時刻は開始時刻より後を選んでください'; return }
    }
  }
  err.textContent=''
  // submit each
  for(const d of dates){
    const choice = perDate[d] || { type:'x' }
    const time_slot = (choice.type==='x') ? 'x' : `${choice.start||'09:00'}-${choice.end||'18:00'}`
    const r = await fetch('/api/shared/session/'+token+'/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ date:d, time_slot }) })
    if(!r.ok){ err.textContent='登録に失敗しました'; return }
  }
  alert('登録しました')
  location.reload()
}
