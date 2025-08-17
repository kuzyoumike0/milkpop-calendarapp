
export async function api(path, opts={}){
  const res = await fetch(path, { headers:{'Content-Type':'application/json'}, ...opts });
  if (!res.ok){
    let msg='api_error';
    try{ const j=await res.json(); msg = j.error || j.message || msg; } catch {}
    throw new Error(msg);
  }
  try{ return await res.json(); } catch { return null; }
}

export function buildTimeSlot(mode, start, end){
  if (mode==='x' || mode==='am' || mode==='pm' || mode==='allday') return mode;
  if (mode==='time') {
    if (!start || !end) throw new Error('time_required');
    // HH:MM
    const s = start;
    const e = end;
    if (s>=e) throw new Error('end_after_start');
    return `time:${s}-${e}`;
  }
  throw new Error('invalid_mode');
}
