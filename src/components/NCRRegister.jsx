// src/components/NCRRegister.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'

const C = { navy:'#0B1F3A', navyMid:'#152D50', sky:'#4A90D9', skyLt:'#7FBCF0', mint:'#00C4A0', amber:'#F5A623', coral:'#E86252', border:'rgba(74,144,217,.18)' }

const SEV_STYLE = { critical:{bg:'rgba(232,98,82,.14)',c:'#E86252'}, major:{bg:'rgba(245,166,35,.14)',c:'#F5A623'}, minor:{bg:'rgba(74,144,217,.14)',c:'#7FBCF0'} }
const STA_STYLE = { open:{bg:'rgba(232,98,82,.12)',c:'#E86252'}, in_progress:{bg:'rgba(245,166,35,.12)',c:'#F5A623'}, closed:{bg:'rgba(0,196,160,.12)',c:'#00C4A0'}, void:{bg:'rgba(120,130,145,.12)',c:'rgba(255,255,255,.3)'} }

export default function NCRRegister() {
  const { org } = useAuth()
  const [ncrs, setNcrs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ ncr_number:'', title:'', description:'', severity:'major', disposition:'', assignee:'', due_date:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!org?.id) return
    supabase.from('nonconformances').select('*').eq('org_id', org.id).order('created_at', { ascending:false })
      .then(({ data }) => { setNcrs(data||[]); setLoading(false) })
  }, [org?.id])

  async function addNCR() {
    if (!form.ncr_number || !form.title) return
    setSaving(true)
    const { data, error } = await supabase.from('nonconformances').insert({ org_id:org.id, ...form, status:'open' }).select().single()
    if (!error && data) { setNcrs(prev=>[data,...prev]); setShowNew(false); setForm({ ncr_number:'', title:'', description:'', severity:'major', disposition:'', assignee:'', due_date:'' }) }
    setSaving(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('nonconformances').update({ status }).eq('id', id)
    setNcrs(prev=>prev.map(n=>n.id===id?{...n,status}:n))
  }

  const fi = (k, placeholder) => <input value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={placeholder} style={{ width:'100%', background:'rgba(11,31,58,.75)', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'7px 10px', outline:'none', boxSizing:'border-box' }} />
  const fib = (k, opts) => <select value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={{ width:'100%', background:'#152D50', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'7px 10px', outline:'none' }}>{opts.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}</select>

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24, background:C.navy, color:'#fff', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div style={{ fontSize:18, fontWeight:600 }}>Nonconformance Register</div>
        <button onClick={()=>setShowNew(!showNew)} style={{ padding:'8px 16px', background:C.sky, border:'none', borderRadius:7, color:'#fff', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>+ New NCR</button>
      </div>

      {/* New NCR form */}
      {showNew && (
        <div style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:500, marginBottom:14, color:C.skyLt }}>New Nonconformance</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
            <div><label style={{ display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(255,255,255,.4)', marginBottom:4 }}>NCR Number</label>{fi('ncr_number','NCR-0047')}</div>
            <div><label style={{ display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(255,255,255,.4)', marginBottom:4 }}>Severity</label>{fib('severity',['critical','major','minor'])}</div>
            <div><label style={{ display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(255,255,255,.4)', marginBottom:4 }}>Assignee</label>{fi('assignee','J. Martinez')}</div>
          </div>
          <div style={{ marginBottom:10 }}><label style={{ display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(255,255,255,.4)', marginBottom:4 }}>Title</label>{fi('title','Dimension out of tolerance — Feature D7')}</div>
          <div style={{ marginBottom:10 }}><label style={{ display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(255,255,255,.4)', marginBottom:4 }}>Description</label><textarea value={form.description||''} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} style={{ width:'100%', background:'rgba(11,31,58,.75)', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'7px 10px', outline:'none', resize:'vertical', boxSizing:'border-box' }} /></div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={addNCR} disabled={saving} style={{ padding:'8px 16px', background:C.mint, border:'none', borderRadius:7, color:C.navy, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{saving?'Saving…':'Save NCR'}</button>
            <button onClick={()=>setShowNew(false)} style={{ padding:'8px 16px', background:'transparent', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:C.skyLt, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* NCR list */}
      {loading ? <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,.3)' }}>Loading…</div> : (
        <div style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
          {ncrs.length === 0 ? (
            <div style={{ textAlign:'center', padding:50, color:'rgba(255,255,255,.3)' }}><div style={{ fontSize:28, marginBottom:10 }}>✓</div>No open nonconformances. Click "+ New NCR" to log one.</div>
          ) : ncrs.map((ncr,i) => {
            const sv = SEV_STYLE[ncr.severity]||SEV_STYLE.major
            const st = STA_STYLE[ncr.status]||STA_STYLE.open
            return (
              <div key={ncr.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:i<ncrs.length-1?`1px solid rgba(74,144,217,.08)`:'none' }}>
                <div style={{ flexShrink:0 }}>
                  <span style={{ fontSize:9, padding:'2px 7px', borderRadius:10, fontWeight:600, textTransform:'uppercase', background:sv.bg, color:sv.c, border:`1px solid ${sv.c}44` }}>{ncr.severity}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500 }}>{ncr.ncr_number} — {ncr.title}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:2 }}>{ncr.assignee} {ncr.due_date ? `· Due ${format(new Date(ncr.due_date),'MMM d')}` : ''} {ncr.created_at ? `· Opened ${format(new Date(ncr.created_at),'MMM d, yyyy')}` : ''}</div>
                </div>
                <select value={ncr.status} onChange={e=>updateStatus(ncr.id,e.target.value)} style={{ background:'rgba(11,31,58,.6)', border:`1px solid ${st.c}44`, borderRadius:6, color:st.c, fontSize:10, padding:'3px 7px', cursor:'pointer', fontFamily:'inherit' }}>
                  {['open','in_progress','closed','void'].map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
