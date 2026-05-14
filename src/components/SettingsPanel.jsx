// src/components/SettingsPanel.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const C = { navy:'#0B1F3A', navyMid:'#152D50', sky:'#4A90D9', skyLt:'#7FBCF0', mint:'#00C4A0', amber:'#F5A623', border:'rgba(74,144,217,.18)' }

function Field({ label, value, onChange, placeholder, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(255,255,255,.4)', marginBottom:5, fontWeight:500 }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', background:'rgba(11,31,58,.75)', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:13, padding:'8px 11px', outline:'none', boxSizing:'border-box' }} />
      {hint && <div style={{ fontSize:10, color:'rgba(255,255,255,.28)', marginTop:3 }}>{hint}</div>}
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:16 }}>
      <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.07em', color:C.skyLt, marginBottom:16, fontWeight:500 }}>{title}</div>
      {children}
    </div>
  )
}

export default function SettingsPanel() {
  const { org, updateCompanyProfile } = useAuth()
  const [form, setForm] = useState({ name:'', cage_code:'', duns:'', iso_cert:'', iatf_cert:'', as9100_cert:'', quality_manager:'', from_email:'' })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (org) setForm({ name:org.name||'', cage_code:org.cage_code||'', duns:org.duns||'', iso_cert:org.iso_cert||'', iatf_cert:org.iatf_cert||'', as9100_cert:org.as9100_cert||'', quality_manager:org.quality_manager||'', from_email:org.from_email||'' })
  }, [org])

  const set = key => val => setForm(p => ({ ...p, [key]: val }))

  async function save() {
    setSaving(true)
    const { error } = await updateCompanyProfile(form)
    setSaving(false)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24, background:C.navy, color:'#fff', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ maxWidth:720 }}>
        <div style={{ fontSize:18, fontWeight:600, marginBottom:20 }}>Settings</div>

        <Card title="Company profile — pre-fills all generated documents">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <Field label="Company name" value={form.name} onChange={set('name')} placeholder="Acme Manufacturing LLC" />
            <Field label="CAGE code" value={form.cage_code} onChange={set('cage_code')} placeholder="3KXB4" />
            <Field label="DUNS number" value={form.duns} onChange={set('duns')} placeholder="12-345-6789" />
            <Field label="Quality manager" value={form.quality_manager} onChange={set('quality_manager')} placeholder="James Martinez, Quality Manager" />
          </div>
        </Card>

        <Card title="Certifications — appear on all exported documents">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <Field label="ISO 9001:2015 cert #" value={form.iso_cert} onChange={set('iso_cert')} placeholder="QM-44912" />
            <Field label="IATF 16949 cert #" value={form.iatf_cert} onChange={set('iatf_cert')} placeholder="IT-88201" />
            <Field label="AS9100D cert #" value={form.as9100_cert} onChange={set('as9100_cert')} placeholder="AS-10041" />
            <Field label="Email for compliance docs" value={form.from_email} onChange={set('from_email')} placeholder="compliance@yourcompany.com" hint="Used as reply-to on outgoing documents" />
          </div>
        </Card>

        <Card title="Active standards — AI knowledge context">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
            {['ISO 9001:2015','IATF 16949:2016','AS9145 (APQP/PPAP)','AS9100D','AIAG PPAP 4th Ed.','ISO 9001:2026 Draft','AIAG/VDA FMEA','ASTM / AMS','NADCAP'].map((std,i)=>(
              <label key={i} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 0', borderBottom:`1px solid rgba(74,144,217,.07)`, fontSize:12, cursor:'pointer', color:'rgba(255,255,255,.8)' }}>
                <input type="checkbox" defaultChecked={i<5} style={{ accentColor:C.sky }} />
                {std}
              </label>
            ))}
          </div>
        </Card>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={save} disabled={saving}
            style={{ padding:'10px 28px', background:C.sky, border:'none', borderRadius:8, color:'#fff', fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
          {saved && <span style={{ fontSize:13, color:C.mint }}>✓ Saved</span>}
        </div>
      </div>
    </div>
  )
}
