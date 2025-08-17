import { Calendar } from './calendar.js'

const calEl = document.getElementById('calendar')
const listEl = document.getElementById('list')
const shareUrlEl = document.getElementById('shareUrl')
const btnCreate = document.getElementById('btnCreate')

let mode = 'multi'
let picked = []

const radios = [...document.querySelectorAll('input[name=selmode]')]
radios.forEach(r=>r.addEventListener('change', ()=>{
  mode = radios.find(x=>x.checked).value
  picked = []
  cal.renderMonth(new Date())
}))

function jstDateStr(d){
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}

const cal = new Calendar(calEl, {
  onPick: (d)=>{
    const s = jstDateStr(d)
    if(mode==='multi'){
      if(picked.includes(s)) picked = picked.filter(x=>x!==s); else picked.push(s)
    }else{
      // range toggle: first click start, second click end
      if(picked.length===0){ picked=[s] }
      else if(picked.length===1){
        const a = new Date(picked[0]); const b = d
        const sDay = new Date(Math.min(a,b)); const eDay = new Date(Math.max(a,b))
        const arr=[]
        for(let t=new Date(sDay); t<=eDay; t.setDate(t.getDate()+1)){
          arr.push(jstDateStr(new Date(t)))
        }
        picked = arr
      }else{
        picked = [s]
      }
    }
    shareUrlEl.textContent = `選択: ${picked.join(', ')}`
    cal.highlight((date)=> picked.includes(jstDateStr(date)))
  }
})
cal.renderMonth(new Date())

btnCreate.addEventListener('click', async ()=>{
  if(picked.length===0){ shareUrlEl.textContent='日付を選択してください'; return }
  const r = await fetch('/api/shared/session', {
    method:'POST', headers:{'content-type':'application/json'},
    body: JSON.stringify({ dates: picked, mode: mode, title: '' })
  })
  if(!r.ok){ shareUrlEl.textContent='作成に失敗しました'; return }
  const data = await r.json()
  shareUrlEl.innerHTML = `共有URL: <a href="${data.url}" target="_blank">${data.url}</a>`
})
