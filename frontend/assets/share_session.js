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

const hourOptions = Array.from({length:48}, (_,i)=> {
  const h = String(Math.floor(i/2)).padStart(2,'0');
  const m = i%2===0 ? '00' : '30';
  return `${h}:${m}`;
})

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
    row.innerHTML = `<div class="jpdate" style="width:180px;font-weight:700"></div>
    <label style="display:flex;align-items:center;gap:6px"><input type="radio" name="t-${d}" ${(perDate[d]?.type||'time')==='time'?'checked':''} value="time"> 時間指定</label>
    <label style="display:flex;align-items:center;gap:6px"><input type="radio" name="t-${d}" ${(perDate[d]?.type||'time')==='block'?'checked':''} value="block"> ブロック（×/午前/午後/終日）</label>
    <select class="select strong start"></select><span>〜</span><select class="select strong end"></select>
    <select class="select strong blockSel" style="max-width:140px;display:none">
      <option value="x">×（不可）</option>
      <option value="午前">午前</option>
      <option value="午後">午後</option>
      <option value="終日">終日</option>
    </select>`
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
    const isBlock = ((perDate[d]?.type)||'time')==='block';
    row.querySelector('.start').disabled = isBlock
    row.querySelector('.end').disabled = isBlock
    row.querySelector('.start').style.display = isBlock ? 'none' : ''
    row.querySelector('.end').style.display = isBlock ? 'none' : ''
    row.querySelector('.blockSel').style.display = isBlock ? '' : 'none'

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
    row.querySelector('.blockSel').onchange = (e)=>{ perDate[d].block = e.target.value }

    const jp = row.querySelector('.jpdate');
    if(jp){ const [yy,mm,dd] = d.split('-'); jp.textContent = `${Number(yy)}年${Number(mm)}月${Number(dd)}日`; }
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
    const time_slot = (choice.type==='block') ? (choice.block||'x') : `${choice.start||'09:00'}-${choice.end||'18:00'}`
    const r = await fetch('/api/shared/session/'+token+'/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ date:d, time_slot }) })
    if(!r.ok){ err.textContent='登録に失敗しました'; return }
  }
  alert('登録しました')
  location.reload()
}
