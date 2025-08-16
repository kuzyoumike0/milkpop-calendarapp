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


// --- Quick Add UI (host manual insertion) ---
const qArea = document.querySelector('#quickArea')
const qErr = document.querySelector('#qErr')
document.querySelector('#qMulti').onclick = ()=>{ mode='multi'; cal.setMode('multi'); toggleActive(); renderQuick() }
document.querySelector('#qRange').onclick = ()=>{ mode='range'; cal.setMode('range'); toggleActive(); renderQuick() }

function renderQuick(){
  qArea.innerHTML=''
  const dates = cal.getSelected()
  dates.forEach(d=>{
    const wrap = document.createElement('div')
    wrap.className='item'
    wrap.innerHTML = `
      <div class="jpdate" style="width:180px;font-weight:700"></div>
      <input class="input uname" placeholder="ユーザー名" style="max-width:160px">
      <label style="display:flex;align-items:center;gap:6px"><input type="radio" name="slot-${d}" value="block" checked> ブロック/×</label>
      <select class="select strong blockSel" style="max-width:140px">
        <option value="x">×（不可）</option>
        <option value="午前">午前</option>
        <option value="午後">午後</option>
        <option value="終日">終日</option>
      </select>
      <label style="display:flex;align-items:center;gap:6px"><input type="radio" name="slot-${d}" value="time"> 時間指定</label>
      <select class="select strong start" disabled style="max-width:120px"></select>
      <span>〜</span>
      <select class="select strong end" disabled style="max-width:120px"></select>
    `
    const start = wrap.querySelector('.start'), end = wrap.querySelector('.end')
    const hours = Array.from({length:48}, (_,i)=> {
  const h = String(Math.floor(i/2)).padStart(2,'0');
  const m = i%2===0 ? '00' : '30';
  return `${h}:${m}`;
})
    hours.forEach(h=>{ const o1=document.createElement('option');o1.value=h;o1.textContent=h;start.appendChild(o1);
                      const o2=document.createElement('option');o2.value=h;o2.textContent=h;end.appendChild(o2)})
    start.value='09:00'; end.value='18:00'

    wrap.querySelectorAll(`input[name="slot-${d}"]`).forEach(r=> r.onchange = ()=>{
      const isTime = (r.value==='time')
      start.disabled = !isTime; end.disabled = !isTime
      wrap.querySelector('.blockSel').disabled = isTime ? true : false
    })
    /* JP date fill */
    const jp=wrap.querySelector('.jpdate'); if(jp){ const [yy,mm,dd] = d.split('-'); jp.textContent = `${Number(yy)}年${Number(mm)}月${Number(dd)}日`; }
    qArea.appendChild(wrap)
  })
}

document.querySelector('#qSubmit').onclick = async ()=>{
  const dates = cal.getSelected()
  if(dates.length===0){ qErr.textContent='日付を選択してください'; return }
  qErr.textContent=''
  for(const wrap of qArea.querySelectorAll('.item')){
    const d = wrap.querySelector('div').textContent.trim()
    const uname = wrap.querySelector('.uname').value.trim()
    const isTime = wrap.querySelector('input[value="time"]').checked
    if(isTime){
      const s = wrap.querySelector('.start').value
      const e = wrap.querySelector('.end').value
      if(s>=e){ qErr.textContent='終了は開始より後にしてください'; return }
      const r = await fetch('/api/shared/manual',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ date:d, member_name: uname, slot_type:'time', start_time:s, end_time:e }) })
      if(!r.ok){ qErr.textContent='登録エラー'; return }
    }else{
      const b = wrap.querySelector('.blockSel').value
      const r = await fetch('/api/shared/manual',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ date:d, member_name: uname, slot_type:'block', block_value:b }) })
      if(!r.ok){ qErr.textContent='登録エラー'; return }
    }
  }
  alert('追加しました'); fetchShared(); renderQuick()
}

// re-render quick UI when calendar selection changes
calEl.addEventListener('change', renderQuick)
