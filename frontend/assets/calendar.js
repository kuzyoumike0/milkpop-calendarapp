// frontend/assets/calendar.js
;(function(){
  const g = (window.MilkCal = window.MilkCal || {})
  class Calendar {
    constructor(root, opts = {}) {
      this.root = root
      this.opts = opts
      this.current = new Date()
      this.current.setHours(0,0,0,0)
    }
    renderMonth(d) {
      this.current = new Date(d.getFullYear(), d.getMonth(), 1)
      this.root.innerHTML = ''

      const header = document.createElement('div')
      header.className = 'cal-header'
      const prev = document.createElement('button'); prev.textContent='←'
      const next = document.createElement('button'); next.textContent='→'
      const title = document.createElement('div')
      title.textContent = `${this.current.getFullYear()}年 ${this.current.getMonth()+1}月`
      header.append(prev, title, next)
      this.root.appendChild(header)

      const week = document.createElement('div')
      week.className='cal-grid'
      ;['日','月','火','水','木','金','土'].forEach(w=>{
        const c=document.createElement('div'); c.className='cal-week'; c.textContent=w; week.appendChild(c)
      })
      this.root.appendChild(week)

      const grid = document.createElement('div')
      grid.className='cal-grid'
      const firstDow = new Date(this.current).getDay()
      const daysInMonth = new Date(this.current.getFullYear(), this.current.getMonth()+1, 0).getDate()

      for(let i=0;i<firstDow;i++){ const cell=document.createElement('div'); cell.className='cal-cell disabled'; grid.appendChild(cell) }

      const today = new Date(); today.setHours(0,0,0,0)
      for(let d=1; d<=daysInMonth; d++){
        const dateObj = new Date(this.current.getFullYear(), this.current.getMonth(), d)
        const cell = document.createElement('div')
        cell.className='cal-cell'
        if(+dateObj === +today) cell.classList.add('cal-today')
        cell.textContent=String(d)
        const ok = this.opts.shouldEnable ? !!this.opts.shouldEnable(dateObj) : true
        if(!ok){ cell.classList.add('disabled') }
        else{
          cell.addEventListener('click', ()=> this.opts.onPick && this.opts.onPick(dateObj))
        }
        grid.appendChild(cell)
      }
      this.root.appendChild(grid)

      prev.addEventListener('click', ()=>{ const m=new Date(this.current); m.setMonth(m.getMonth()-1); this.renderMonth(m); this._reapplyHighlight() })
      next.addEventListener('click', ()=>{ const m=new Date(this.current); m.setMonth(m.getMonth()+1); this.renderMonth(m); this._reapplyHighlight() })
    }
    highlight(predicateFn){
      this._predicate = predicateFn; this._reapplyHighlight()
    }
    _reapplyHighlight(){
      if(!this._predicate) return
      const grids = this.root.querySelectorAll('.cal-grid')
      const dayGrid = grids[1] // 0=weekday, 1=days
      if(!dayGrid) return
      const firstDow = new Date(this.current).getDay()
      const cells = dayGrid.querySelectorAll('.cal-cell')
      cells.forEach((cell, idx)=>{
        cell.classList.remove('selected')
        if(cell.classList.contains('disabled')) return
        const day = idx - firstDow + 1
        if(day < 1) return
        const dateObj = new Date(this.current.getFullYear(), this.current.getMonth(), day)
        if(this._predicate(dateObj)) cell.classList.add('selected')
      })
    }
  }
  g.Calendar = Calendar
})()
