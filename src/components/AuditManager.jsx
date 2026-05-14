// src/components/AuditManager.jsx
import { useState } from 'react'
import { format, addDays } from 'date-fns'

const C = { navy:'#0B1F3A', navyMid:'#152D50', sky:'#4A90D9', skyLt:'#7FBCF0', mint:'#00C4A0', amber:'#F5A623', coral:'#E86252', gold:'#D4AF37', purple:'#7F77DD', border:'rgba(74,144,217,.18)' }

const AUDIT_TEMPLATES = {
  'ISO 9001:2015 Internal Audit': ['4.1 Context of Organization','4.2 Interested Parties','5.1 Leadership','6.1 Risk & Opportunity','6.2 Quality Objectives','7.1 Resources','7.2 Competence','7.5 Documented Info','8.1 Planning','8.4 External Providers','8.6 Release of Products','9.1 Monitoring','9.3 Management Review','10.2 NCR & Corrective Action'],
  'IATF 16949 Process Audit':     ['5.3.2 Customer Specific Requirements','8.3 Product & Process Design','8.4 Supplier Management','8.5 Production Control','8.6 Product Release','8.7 Control of NC Product','AIAG Core Tools'],
  'PPAP Readiness Review':        ['El.1 Design Records','El.5 Process Flow','El.6 PFMEA','El.7 Control Plan','El.8 MSA / Gage R&R','El.9 Dimensional Results','El.10 Material Results','El.11 Cpk Study','El.17 Customer Specific Req.','El.18 PSW'],
  'Supplier Quality Audit':       ['Quality System Cert.','CSR Acknowledgement','Corrective Action Response Time','PPAP Submission History','On-Time Delivery','PPM Performance','Counterfeit Controls'],
}

const now = new Date()

const SAMPLE_AUDITS = [
  { id:1, type:'ISO 9001:2015 Internal Audit', auditor:'J. Martinez', date:format(addDays(now,14),'yyyy-MM-dd'), status:'scheduled', scope:'Full QMS — All clauses', location:'Main facility', findings:0 },
  { id:2, type:'PPAP Readiness Review', auditor:'K. Lee', date:format(addDays(now,7),'yyyy-MM-dd'), status:'scheduled', scope:'P/N 8841-JKL — Level 3 submission', location:'Engineering', findings:0 },
  { id:3, type:'IATF 16949 Process Audit', auditor:'T. Brown', date:format(addDays(now,-21),'yyyy-MM-dd'), status:'completed', scope:'Production — CNC Turning cell', location:'Shop floor', findings:3 },
  { id:4, type:'Supplier Quality Audit', auditor:'J. Martinez', date:format(addDays(now,-45),'yyyy-MM-dd'), status:'completed', scope:'AcmeSteel Corp.', location:'Remote', findings:1 },
]

export default function AuditManager() {
  const [audits, setAudits] = useState(SAMPLE_AUDITS)
  const [selected, setSelected] = useState(null)
  const [checklist, setChecklist] = useState({})
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ type:'ISO 9001:2015 Internal Audit', auditor:'', date:'', scope:'', location:'' })

  function openAudit(audit) {
    setSelected(audit)
    const tpl = AUDIT_TEMPLATES[audit.type] || []
    const init = {}
    tpl.forEach((item,i) => { init[i] = checklist[`${audit.id}-${i}`] || 'pending' })
    setChecklist(init)
  }

  function setItem(idx, val) {
    setChecklist(prev => ({ ...prev, [idx]: val }))
  }

  const STA = { scheduled:{bg:'rgba(74,144,217,.14)',c:'#7FBCF0'}, completed:{bg:'rgba(0,196,160,.14)',c:'#00C4A0'}, 'in-progress':{bg:'rgba(245,166,35,.14)',c:'#F5A623'}, overdue:{bg:'rgba(232,98,82,.14)',c:'#E86252'} }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24, background:C.navy, color:'#fff', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div style={{ fontSize:18, fontWeight:600 }}>Audit Manager</div>
        <button onClick={()=>setShowNew(!showNew)} style={{ padding:'8px 16px', background:C.sky, border:'none', borderRadius:7, color:'#fff', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>+ Schedule Audit</button>
      </div>

      {showNew && (
        <div style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:500, color:C.skyLt, marginBottom:14 }}>New Audit</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            {[['Audit type',<select value={newForm.type} onChange={e=>setNewForm(p=>({...p,type:e.target.value}))} style={{ width:'100%', background:'#152D50', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'7px 10px', outline:'none' }}>{Object.keys(AUDIT_TEMPLATES).map(t=><option key={t}>{t}</option>)}</select>],['Auditor / Lead',<input value={newForm.auditor} onChange={e=>setNewForm(p=>({...p,auditor:e.target.value}))} placeholder="J. Martinez" style={{ width:'100%', background:'rgba(11,31,58,.75)', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'7px 10px', outline:'none', boxSizing:'border-box' }} />],['Scheduled date',<input type="date" value={newForm.date} onChange={e=>setNewForm(p=>({...p,date:e.target.value}))} style={{ width:'100%', background:'rgba(11,31,58,.75)', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'7px 10px', outline:'none', boxSizing:'border-box' }} />],['Location',<input value={newForm.location} onChange={e=>setNewForm(p=>({...p,location:e.target.value}))} placeholder="Main facility" style={{ width:'100%', background:'rgba(11,31,58,.75)', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'7px 10px', outline:'none', boxSizing:'border-box' }} />]].map(([label,field])=>(
              <div key={label}><label style={{ display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(255,255,255,.4)', marginBottom:4 }}>{label}</label>{field}</div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>{ setAudits(prev=>[...prev,{ id:Date.now(),...newForm,status:'scheduled',findings:0 }]); setShowNew(false) }} style={{ padding:'8px 16px', background:C.mint, border:'none', borderRadius:7, color:C.navy, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Schedule</button>
            <button onClick={()=>setShowNew(false)} style={{ padding:'8px 16px', background:'transparent', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:C.skyLt, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap:16 }}>
        {/* Audit list */}
        <div style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
          {audits.map((audit,i) => {
            const st = STA[audit.status]||STA.scheduled
            return (
              <div key={audit.id} onClick={()=>openAudit(audit)}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:i<audits.length-1?`1px solid rgba(74,144,217,.08)`:'none', cursor:'pointer', background:selected?.id===audit.id?'rgba(74,144,217,.08)':'none', transition:'.12s' }}>
                <div style={{ width:36, height:36, borderRadius:8, background:'rgba(74,144,217,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                  {audit.status==='completed'?'✓':'📋'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{audit.type}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:2 }}>
                    {audit.auditor} · {audit.date} · {audit.location}
                    {audit.findings > 0 && <span style={{ color:C.amber }}> · {audit.findings} finding{audit.findings>1?'s':''}</span>}
                  </div>
                </div>
                <span style={{ fontSize:9, padding:'2px 8px', borderRadius:10, fontWeight:600, textTransform:'uppercase', background:st.bg, color:st.c, border:`1px solid ${st.c}44`, flexShrink:0 }}>{audit.status}</span>
              </div>
            )
          })}
        </div>

        {/* Checklist panel */}
        {selected && (
          <div style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, padding:18, overflow:'auto', maxHeight:'70vh' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>{selected.type}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginTop:2 }}>{selected.scope||selected.location}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.4)', cursor:'pointer', fontSize:18 }}>×</button>
            </div>
            <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(255,255,255,.3)', marginBottom:10 }}>Audit checklist</div>
            {(AUDIT_TEMPLATES[selected.type]||[]).map((item,idx) => {
              const val = checklist[idx]||'pending'
              return (
                <div key={idx} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:`1px solid rgba(74,144,217,.07)` }}>
                  <div style={{ flex:1, fontSize:12, color:'rgba(255,255,255,.8)' }}>{item}</div>
                  <select value={val} onChange={e=>setItem(idx,e.target.value)} style={{ background:'rgba(11,31,58,.7)', border:`1px solid rgba(74,144,217,.3)`, borderRadius:5, color: val==='conforming'?C.mint:val==='nonconforming'?C.coral:val==='opportunity'?C.amber:'rgba(255,255,255,.4)', fontSize:10, padding:'3px 7px', cursor:'pointer', fontFamily:'inherit' }}>
                    <option value="pending">Pending</option>
                    <option value="conforming">✓ Conforming</option>
                    <option value="nonconforming">✗ Nonconforming</option>
                    <option value="opportunity">⚠ Opportunity</option>
                    <option value="n/a">N/A</option>
                  </select>
                </div>
              )
            })}
            <div style={{ marginTop:14, fontSize:11, color:'rgba(255,255,255,.3)' }}>
              Conforming: {Object.values(checklist).filter(v=>v==='conforming').length} · 
              Nonconforming: <span style={{ color:C.coral }}>{Object.values(checklist).filter(v=>v==='nonconforming').length}</span> · 
              Opportunities: <span style={{ color:C.amber }}>{Object.values(checklist).filter(v=>v==='opportunity').length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
