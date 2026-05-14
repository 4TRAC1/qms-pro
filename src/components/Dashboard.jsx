// src/components/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const C = { navy:'#0B1F3A', navyMid:'#152D50', sky:'#4A90D9', skyLt:'#7FBCF0', mint:'#00C4A0', amber:'#F5A623', coral:'#E86252', gold:'#D4AF37', purple:'#7F77DD', border:'rgba(74,144,217,.18)' }

function MetricCard({ label, value, sub, color, onClick }) {
  return (
    <div onClick={onClick} style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px 18px', cursor:onClick?'pointer':'default', transition:'.15s', flex:1 }}>
      <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(255,255,255,.4)', marginBottom:8, fontWeight:500 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700, color:color||'#fff', marginBottom:4 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'rgba(255,255,255,.35)' }}>{sub}</div>}
    </div>
  )
}

function ComplianceBar({ label, pct, color }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
        <span style={{ color:'rgba(255,255,255,.7)' }}>{label}</span>
        <span style={{ color, fontWeight:600 }}>{pct}%</span>
      </div>
      <div style={{ height:5, background:'rgba(74,144,217,.12)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:3, transition:'width .6s ease' }} />
      </div>
    </div>
  )
}

function PitfallCard({ severity, title, clause, desc, action }) {
  const colors = { critical:C.coral, major:C.amber, minor:C.skyLt }
  const color = colors[severity]||C.skyLt
  return (
    <div style={{ background:C.navyMid, border:`1px solid ${color}33`, borderRadius:10, padding:14, borderLeft:`3px solid ${color}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
        <span style={{ fontSize:9, padding:'2px 7px', borderRadius:10, background:`${color}22`, color, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>{severity}</span>
        <span style={{ fontFamily:'monospace', fontSize:10, color:'rgba(255,255,255,.35)' }}>{clause}</span>
      </div>
      <div style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>{title}</div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', lineHeight:1.5 }}>{desc}</div>
      {action && <div style={{ fontSize:11, color, marginTop:6 }}>→ {action}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { org } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ docs:0, openNcr:0, activePpap:0 })

  useEffect(() => {
    if (!org?.id) return
    Promise.all([
      supabase.from('documents').select('id', { count:'exact', head:true }).eq('org_id', org.id),
      supabase.from('nonconformances').select('id', { count:'exact', head:true }).eq('org_id', org.id).eq('status','open'),
      supabase.from('ppap_packages').select('id', { count:'exact', head:true }).eq('org_id', org.id).eq('status','in_progress'),
    ]).then(([docs, ncr, ppap]) => {
      setStats({ docs: docs.count||0, openNcr: ncr.count||0, activePpap: ppap.count||0 })
    })
  }, [org?.id])

  const PITFALLS = [
    { severity:'critical', clause:'Cl. 4.1', title:'Context of organization not documented', desc:'Many orgs list interested parties without documented analysis of internal/external issues. Auditors will ask for objective evidence.', action:'Document context analysis in QMS manual or dedicated procedure' },
    { severity:'critical', clause:'IATF 5.3.2', title:'CSR tracking gaps', desc:'Customer-specific requirements not formally identified, reviewed, or cascaded to relevant functions. Top IATF finding.', action:'Create CSR matrix per customer and review at management review' },
    { severity:'major', clause:'Cl. 6.1', title:'Risk register has no outputs', desc:'Risk assessment documented but no risk treatment plans, actions, or effectiveness checks. Incomplete PDCA cycle.', action:'Link each risk to an action owner, due date, and effectiveness criterion' },
    { severity:'major', clause:'Cl. 9.3', title:'Management review missing required inputs', desc:'Reviews often omit: changes in external/internal issues, adequacy of resources, or customer feedback trends.', action:'Use standard agenda template covering all ISO 9001:2015 Cl. 9.3.2 inputs' },
    { severity:'major', clause:'SPC', title:'Process capability below 1.67 Cpk', desc:'Submitting PPAP with Cpk <1.67 without written customer deviation is a common cause of PSW rejection.', action:'Obtain written customer approval before submitting, or improve process' },
    { severity:'minor', clause:'Cl. 7.2', title:'Training effectiveness not verified', desc:'Training records exist but no evidence of effectiveness evaluation. Competency must be evaluated, not just attendance recorded.', action:'Add post-training assessment or on-the-job evaluation to training records' },
  ]

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24, background:C.navy, color:'#fff', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', color:'rgba(255,255,255,.35)', marginBottom:4 }}>Welcome back</div>
        <div style={{ fontSize:20, fontWeight:600 }}>{org?.name || 'QMS Pro Dashboard'}</div>
      </div>

      {/* Metric cards */}
      <div style={{ display:'flex', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        <MetricCard label="Overall compliance" value="94%" sub="ISO 9001 + IATF + AS9145" color={C.mint} />
        <MetricCard label="Docs generated" value={stats.docs} sub="All time" color={C.skyLt} onClick={()=>navigate('/library')} />
        <MetricCard label="Open NCRs" value={stats.openNcr} sub="Require disposition" color={stats.openNcr>5?C.coral:C.amber} onClick={()=>navigate('/ncr')} />
        <MetricCard label="Active PPAPs" value={stats.activePpap} sub="In progress" color={C.purple} onClick={()=>navigate('/ppap')} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        {/* Standards compliance */}
        <div style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.07em', color:C.skyLt, marginBottom:14, fontWeight:500 }}>Standards compliance</div>
          <ComplianceBar label="ISO 9001:2015" pct={96} color={C.mint} />
          <ComplianceBar label="IATF 16949:2016" pct={91} color={C.sky} />
          <ComplianceBar label="AS9145 (APQP)" pct={88} color={C.purple} />
          <ComplianceBar label="AS9100D" pct={93} color={C.gold} />
          <ComplianceBar label="ISO 9001:2026 (Draft)" pct={74} color={C.amber} />
        </div>

        {/* Quick actions */}
        <div style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.07em', color:C.skyLt, marginBottom:14, fontWeight:500 }}>Quick actions</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { label:'✦ Generate compliance document', path:'/docs', color:C.sky },
              { label:'◈ Start new PPAP package', path:'/ppap', color:C.purple },
              { label:'⚠ Log a nonconformance', path:'/ncr', color:C.amber },
              { label:'✓ Schedule internal audit', path:'/audits', color:C.mint },
              { label:'⚙ Update company profile', path:'/settings', color:'rgba(255,255,255,.5)' },
            ].map(a => (
              <button key={a.path} onClick={()=>navigate(a.path)} style={{ display:'block', width:'100%', padding:'9px 12px', background:'rgba(11,31,58,.5)', border:`1px solid rgba(74,144,217,.15)`, borderRadius:8, color:a.color, fontSize:12, fontFamily:'inherit', cursor:'pointer', textAlign:'left', transition:'.12s' }}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pitfall Radar */}
      <div style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.07em', color:C.skyLt, fontWeight:500 }}>⚡ Pitfall Radar — top audit failure causes</div>
          <span style={{ fontSize:10, color:'rgba(255,255,255,.3)' }}>AI-monitored</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {PITFALLS.map((p,i) => <PitfallCard key={i} {...p} />)}
        </div>
      </div>
    </div>
  )
}
