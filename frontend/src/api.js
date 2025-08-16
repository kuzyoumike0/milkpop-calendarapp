export async function addPersonal(body){
  const r = await fetch('/api/personal', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
  if(!r.ok) throw new Error('personal add failed')
  return r.json()
}
export async function addShared(body){
  const r = await fetch('/api/shared', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
  if(!r.ok) throw new Error('shared add failed')
  return r.json()
}
