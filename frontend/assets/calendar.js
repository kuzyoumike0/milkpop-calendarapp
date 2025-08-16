export function pad(n){return String(n).padStart(2,'0')}
export function ymd(d){return d ? `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` : null}

export function buildMonth(year, month){ // month: 1-12
  const first = new Date(year, month-1, 1)
  const startDay = first.getDay()
  const days = new Date(year, month, 0).getDate()
  const cells = []
  for(let i=0;i<startDay;i++) cells.push(null)
  for(let d=1; d<=days; d++) cells.push(new Date(year, month-1, d))
  while(cells.length%7!==0) cells.push(null)
  return cells
}

export function Calendar(el, {mode='multi', disabledDates=[]}={}){
  const t = new Date()
  let y = t.getFullYear(), m = t.getMonth()+1
  let selected = [], range = {start:null, end:null}
  const dis = new Set(disabledDates||[])

  const head = el.querySelector('.cal-head')
  const grid = el.querySelector('.cal-grid')
  const title = el.querySelector('.cal-title')

  function render(){
    title.textContent = `${y}-${pad(m)}`
    grid.innerHTML = ''
    ;['日','月','火','水','木','金','土'].forEach(w=>{
      const s=document.createElement('div'); s.className='cal-day'; s.textContent=w; grid.appendChild(s)
    })
    const cells = buildMonth(y,m)
    const today = ymd(new Date())
    cells.forEach(d=>{
      const btn = document.createElement('button')
      btn.className = 'cal-btn'
      if(!d){ btn.disabled=true; btn.textContent=''; grid.appendChild(btn); return }
      const v = ymd(d)
      btn.textContent = d.getDate()
      if(v===today) btn.classList.add('today')
      const isSel = (mode==='multi' && selected.includes(v)) || (mode==='range' && v && range.start && (range.end? (v>=range.start && v<=range.end) : v===range.start))
      if(isSel) btn.classList.add('sel')
      if(dis.has(v)) btn.classList.add('disabled')
      btn.onclick = ()=>{
        if(dis.has(v)) return
        if(mode==='multi'){
          if(selected.includes(v)) selected = selected.filter(x=>x!==v)
          else selected.push(v)
          el.dispatchEvent(new CustomEvent('change',{detail:{selected}}))
        }else{
          if(!range.start){ range.start=v; range.end=null }
          else if(!range.end){ range.end = (v<range.start)? range.start : v }
          else { range.start=v; range.end=null }
          el.dispatchEvent(new CustomEvent('change',{detail:{range}}))
        }
        render()
      }
      grid.appendChild(btn)
    })
  }

  function prev(){ m--; if(m<1){m=12;y--} render() }
  function next(){ m++; if(m>12){m=1;y++} render() }
  function setMode(v){ mode=v; render() }
  function getSelected(){ return mode==='multi' ? selected.slice() : (range.start ? [range.start, range.end||range.start] : []) }

  head.querySelector('.prev').onclick=prev
  head.querySelector('.next').onclick=next

  render()

  return { setMode, getSelected, render, setDisabledDates:(arr)=>{ dis.clear(); (arr||[]).forEach(x=>dis.add(x)); render() } }
}
