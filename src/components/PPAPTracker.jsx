// src/components/PPAPTracker.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const C = { navy:'#0B1F3A', navyMid:'#152D50', sky:'#4A90D9', skyLt:'#7FBCF0', mint:'#00C4A0', mintD:'#00957A', amber:'#F5A623', coral:'#E86252', purple:'#7F77DD', border:'rgba(74,144,217,.18)' }

const AIAG_ELEMENTS = [
  'Design Records', 'Engineering Change Documents', 'Customer Engineering Approval',
  'Design FMEA', 'Process Flow Diagram', 'Process FMEA (PFMEA)',
  'Control Plan', 'MSA Studies (Gage R&R)', 'Dimensional Results',
  'Material & Performance Test Results', 'Initial Process Study (Cpk)',
  'Qualified Laboratory Documentation', 'Appearance Approval Report (AAR)',
  'Sample Production Parts', 'Master Sample', 'Checking Aids',
  'Customer-Specific Requirements (CSR)', 'Part Submission Warrant (PSW)',
]

function PPAPCard({ pkg, onUpdate }) {
  const complete = pkg.elements_complete || []
  const pct = Math.round((complete.length / 18) * 100)
  const color = pct === 100 ? C.mint : pct >= 70 ? C.amber : C.coral

  return (
    <div style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, padding:18, marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:600 }}>{pkg.part_number}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:2 }}>{pkg.customer} · {pkg.submission_level}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:22, fontWeight:700, color }}>{pct}%</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,.35)' }}>{complete.length}/18 elements</div>
        </div>
      </div>
      <div style={{ height:5, background:'rgba(74,144,217,.12)', borderRadius:3, overflow:'hidden', marginBottom:14 }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:3, transition:'width .5s' }} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 12px' }}>
        {AIAG_ELEMENTS.map((el, idx) => {
          const num = idx + 1
          const done = complete.includes(num)
          return (
            <label key={idx} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:done?C.mint:'rgba(255,255,255,.45)', cursor:'pointer', padding:'3px 0', borderBottom:`1px solid rgba(74,144,217,.05)` }}>
              <input type="checkbox" checked={done} style={{ accentColor:C.mint }} onChange={async () => {
                const updated = done ? complete.filter(n=>n!==num) : [...complete, num]
                await supabase.from('ppap_packages').update({ elements_complete:updated }).eq('id', pkg.id)
                onUpdate(pkg.id, updated)
              }} />
              <span style={{ fontSize:9, fontFamily:'monospace', color:'rgba(255,255,255,.25)', flexShrink:0 }}>El.{num}</span>
              {el}
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default function PPAPTracker() {
  const { org } = useAuth()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ part_number:'', customer:'', submission_level:'Level 3' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!org?.id) return
    supabase.from('ppap_packages').select('*').eq('org_id', org.id).order('created_at', { ascending:false })
      .then(({ data }) => { setPackages(data||[]); setLoading(false) })
  }, [org?.id])

  function onUpdate(id, updated) {
    setPackages(prev => prev.map(p => p.id===id ? { ...p, elements_complete:updated } : p))
  }

  async function addPackage() {
    if (!form.part_number) return
    setSaving(true)
    const { data, error } = await supabase.from('ppap_packages').insert({ org_id:org.id, ...form, status:'in_progress', elements_complete:[] }).select().single()
    if (!error&&data) { setPackages(prev=>[data,...prev]); setShowNew(false); setForm({ part_number:'', customer:'', submission_level:'Level 3' }) }
    setSaving(false)
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24, background:C.navy, color:'#fff', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div style={{ fontSize:18, fontWeight:600 }}>PPAP Tracker</div>
        <button onClick={()=>setShowNew(!showNew)} style={{ padding:'8px 16px', background:C.sky, border:'none', borderRadius:7, color:'#fff', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>+ New PPAP</button>
      </div>

      {showNew && (
        <div style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
            {[['Part number','part_number','8841-XYZ'],['Customer','customer','Ford Motor Co.']].map(([label,key,ph])=>(
              <div key={key}>
                <label style={{ display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(255,255,255,.4)', marginBottom:4 }}>{label}</label>
                <input value={form[key]||''} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={{ width:'100%', background:'rgba(11,31,58,.75)', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'7px 10px', outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(255,255,255,.4)', marginBottom:4 }}>Level</label>
              <select value={form.submission_level} onChange={e=>setForm(p=>({...p,submission_level:e.target.value}))} style={{ width:'100%', background:'#152D50', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'7px 10px', outline:'none' }}>
                {['Level 1','Level 2','Level 3','Level 4','Level 5'].map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={addPackage} disabled={saving} style={{ padding:'8px 16px', background:C.mint, border:'none', borderRadius:7, color:C.navy, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{saving?'Saving…':'Create PPAP'}</button>
            <button onClick={()=>setShowNew(false)} style={{ padding:'8px 16px', background:'transparent', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:C.skyLt, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,.3)' }}>Loading…</div> :
        packages.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, color:'rgba(255,255,255,.3)' }}><div style={{ fontSize:32, marginBottom:10 }}>◈</div>No PPAP packages yet. Click "+ New PPAP" to start one.</div>
        ) : packages.map(pkg => <PPAPCard key={pkg.id} pkg={pkg} onUpdate={onUpdate} />)
      }
    </div>
  )
}
