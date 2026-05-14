// src/components/DocStudio.jsx
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { exportDocumentPDF } from '../lib/pdfExport'

const C = { navy:'#0B1F3A', navyMid:'#152D50', sky:'#4A90D9', skyLt:'#7FBCF0', mint:'#00C4A0', mintD:'#00957A', amber:'#F5A623', amberD:'#C4841A', coral:'#E86252', gold:'#D4AF37', purple:'#7F77DD', purpleD:'#534AB7', border:'rgba(74,144,217,.18)' }

const DOCS = [
  { id:'coc',   label:'COC',   name:'Certificate of Compliance',   color:C.mint,   bg:'rgba(0,196,160,.14)',   std:'ISO 9001 · IATF · AS9100' },
  { id:'coa',   label:'COA',   name:'Certificate of Analysis',      color:C.skyLt,  bg:'rgba(74,144,217,.14)', std:'ASTM · ASME · AMS' },
  { id:'coo',   label:'COO',   name:'Certificate of Origin',        color:C.gold,   bg:'rgba(212,175,55,.14)', std:'USMCA · CBP · FTA' },
  { id:'psw',   label:'PSW',   name:'Part Submission Warrant',      color:C.purple, bg:'rgba(127,119,221,.14)',std:'AIAG PPAP · AS9145' },
  { id:'fair',  label:'FAIR',  name:'First Article Inspection',     color:C.amber,  bg:'rgba(245,166,35,.14)', std:'AS9102 Rev C' },
  { id:'mtr',   label:'MTR',   name:'Material Test Report',         color:C.coral,  bg:'rgba(232,98,82,.14)',  std:'ASTM · AMS · ASME' },
  { id:'8d',    label:'8D',    name:'8D Corrective Action',         color:C.skyLt,  bg:'rgba(74,144,217,.14)', std:'IATF 16949 · AIAG' },
  { id:'pfmea', label:'PFMEA', name:'Process FMEA',                 color:C.coral,  bg:'rgba(232,98,82,.14)',  std:'AIAG/VDA' },
  { id:'scar',  label:'SCAR',  name:'Supplier Corrective Action',   color:C.amber,  bg:'rgba(245,166,35,.14)', std:'ISO 9001 · IATF' },
  { id:'dev',   label:'DEV',   name:'Deviation / Waiver',           color:C.gold,   bg:'rgba(212,175,55,.14)', std:'AS9100 · ISO 9001' },
  { id:'imds',  label:'IMDS',  name:'IMDS / REACH Report',          color:C.mint,   bg:'rgba(0,196,160,.14)',  std:'REACH · RoHS · CMRT' },
  { id:'qmp',   label:'QMP',   name:'Quality Management Plan',      color:C.purple, bg:'rgba(127,119,221,.14)',std:'ISO 9001 · AS9145' },
]

const DEFAULTS = {
  coc:   { pn:'8841-JKL', rev:'Rev C', customer:'Ford Motor Company', po:'PO-2026-00441', lot:'A44-222', qty:'500 PCS', date:'2026-01-14', standards:'ISO 9001:2015, IATF 16949:2016, Customer Drawing Rev C', process:'Zinc plating per ASTM B633, Type II', remarks:'None. All characteristics conform to drawing and customer requirements.' },
  coa:   { material:'AISI 4140 Alloy Steel', heat:'HT-44912-B', supplier:'AcmeSteel Corp.', cert:'MC-20260108-3', spec:'ASTM A29 / AMS 6349', required:'UTS ≥ 95 ksi, YS ≥ 80 ksi, Elongation ≥ 18%, Hardness 28-34 HRC, Carbon 0.38-0.43%', actual:'UTS: 102 ksi, YS: 87 ksi, Elong: 21%, Hardness: 31 HRC, C: 0.40%' },
  coo:   { exporter:'Acme Manufacturing LLC', origin:'United States', consignee:'Ford Motor Co., Germany', hts:'8708.99.8180', agreement:'USMCA' },
  psw:   { pn:'8841-JKL', customer:'Ford Motor Co.', level:'Level 3', reason:'Initial submission', elements:'1,2,3,4,5,6,7,8,9,10,11,12,14,16' },
  fair:  { pn:'9912-AAX', drawing:'DWG-9912-AAX Rev B', measurements:'Dia 12.35±0.05: 12.37 | Depth 8.00±0.10: 8.04 | Thread M12x1.25: PASS | Surface 1.6Ra: 1.4Ra' },
  mtr:   { material:'AISI 4140', heat:'HT-44912-B', spec:'ASTM A29 / AMS 6349', supplier:'AcmeSteel Corp.' },
  '8d':  { problem:'Zinc plating 0.00031" measured vs 0.0005" minimum per ASTM B633, Type II. Lot A44-219, 240 lbs. Found at incoming inspection.', ncr:'NCR-0045', team:'J. Martinez (Lead), K. Lee, T. Brown (QE), Supplier Rep.' },
  pfmea: { process:'CNC Turning — Diameter Feature D7', steps:'Load blank, rough turn OD, finish turn 12.35±0.05mm, part-off, deburr, 100% gauge inspection.' },
  scar:  { supplier:'AcmeSteel Corp.', due:'2026-01-25', problem:'Wrong revision received. Rev B delivered, Rev C required per ECN-0841. 240 lbs, PO-2026-00398.' },
  dev:   { description:'Surface roughness 2.1 Ra vs 1.6 Ra max. Functional analysis: no sealing impact.', qty:'25 PCS', requestor:'Engineering' },
  imds:  { materials:'AISI 4140 steel, Zinc plating (ASTM B633), Trivalent chromate coating', scope:'Full RoHS + REACH + CMRT' },
  qmp:   { program:'Program 4471-A Bracket Assembly', standard:'AS9145 (APQP)', objectives:'Zero PPM, Cpk ≥ 1.67, PPAP Level 3 by Mar 2026.' },
}

const DOC_NUMBERS = { coc:'COC-2026-0143', coa:'COA-2026-0090', coo:'COO-2026-0032', psw:'PSW-8841-L3', fair:'FAIR-9912-B', mtr:'MTR-4140-B', '8d':'8D-NCR-0045', pfmea:'PFMEA-CNC-D7', scar:'SCAR-2026-0018', dev:'DEV-2026-0009', imds:'IMDS-2026-0041', qmp:'QMP-4471-A' }

function fi(val, onChange) {
  return <input value={val||''} onChange={e=>onChange(e.target.value)} style={{ width:'100%', background:'rgba(11,31,58,.75)', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'7px 10px', outline:'none', boxSizing:'border-box' }} />
}
function fa(val, onChange, rows=3) {
  return <textarea value={val||''} onChange={e=>onChange(e.target.value)} rows={rows} style={{ width:'100%', background:'rgba(11,31,58,.75)', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'7px 10px', outline:'none', resize:'vertical', lineHeight:1.5, boxSizing:'border-box' }} />
}
function fs(val, onChange, opts) {
  return <select value={val||opts[0]} onChange={e=>onChange(e.target.value)} style={{ width:'100%', background:'#152D50', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'7px 10px', outline:'none', boxSizing:'border-box' }}>{opts.map(o=><option key={o}>{o}</option>)}</select>
}
function FL({ label }) { return <label style={{ display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(255,255,255,.38)', marginBottom:4, fontWeight:500 }}>{label}</label> }
function FG({ label, children }) { return <div style={{ marginBottom:9 }}><FL label={label} />{children}</div> }
function R2({ children }) { return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>{children}</div> }

function FormFields({ docId, fields, setField }) {
  const f = k => fields[k]||''
  const s = k => v => setField(k,v)
  const forms = {
    coc: <><R2><FG label="Part #">{fi(f('pn'),s('pn'))}</FG><FG label="Rev">{fi(f('rev'),s('rev'))}</FG></R2><FG label="Customer">{fi(f('customer'),s('customer'))}</FG><R2><FG label="PO #">{fi(f('po'),s('po'))}</FG><FG label="Lot">{fi(f('lot'),s('lot'))}</FG></R2><R2><FG label="Qty">{fi(f('qty'),s('qty'))}</FG><FG label="Ship date">{fi(f('date'),s('date'))}</FG></R2><FG label="Standards">{fi(f('standards'),s('standards'))}</FG><FG label="Special processes">{fi(f('process'),s('process'))}</FG><FG label="Remarks / deviations">{fa(f('remarks'),s('remarks'))}</FG></>,
    coa: <><R2><FG label="Material">{fi(f('material'),s('material'))}</FG><FG label="Heat #">{fi(f('heat'),s('heat'))}</FG></R2><R2><FG label="Supplier">{fi(f('supplier'),s('supplier'))}</FG><FG label="Mill cert #">{fi(f('cert'),s('cert'))}</FG></R2><FG label="Spec">{fi(f('spec'),s('spec'))}</FG><FG label="Required properties">{fa(f('required'),s('required'))}</FG><FG label="Actual test results (AI evaluates)">{fa(f('actual'),s('actual'))}</FG></>,
    coo: <><R2><FG label="Exporter">{fi(f('exporter'),s('exporter'))}</FG><FG label="Country of origin">{fi(f('origin'),s('origin'))}</FG></R2><R2><FG label="Consignee">{fi(f('consignee'),s('consignee'))}</FG><FG label="HTS code">{fi(f('hts'),s('hts'))}</FG></R2><FG label="Trade agreement">{fs(f('agreement'),s('agreement'),['USMCA','General / None'])}</FG></>,
    psw: <><R2><FG label="Part #">{fi(f('pn'),s('pn'))}</FG><FG label="Level">{fs(f('level'),s('level'),['Level 1','Level 2','Level 3','Level 4','Level 5'])}</FG></R2><FG label="Customer">{fi(f('customer'),s('customer'))}</FG><FG label="Reason">{fs(f('reason'),s('reason'),['Initial submission','Engineering change','Tooling transfer','Annual re-validation'])}</FG><FG label="Elements complete (AI validates all 18)">{fa(f('elements'),s('elements'),2)}</FG></>,
    fair: <><R2><FG label="Part #">{fi(f('pn'),s('pn'))}</FG><FG label="Drawing">{fi(f('drawing'),s('drawing'))}</FG></R2><FG label="Measured characteristics">{fa(f('measurements'),s('measurements'),4)}</FG></>,
    mtr: <><R2><FG label="Material">{fi(f('material'),s('material'))}</FG><FG label="Heat #">{fi(f('heat'),s('heat'))}</FG></R2><FG label="Spec">{fi(f('spec'),s('spec'))}</FG><FG label="Supplier">{fi(f('supplier'),s('supplier'))}</FG></>,
    '8d': <><FG label="Problem statement">{fa(f('problem'),s('problem'),4)}</FG><R2><FG label="NCR #">{fi(f('ncr'),s('ncr'))}</FG><FG label="Team">{fi(f('team'),s('team'))}</FG></R2></>,
    pfmea: <><FG label="Process / operation">{fi(f('process'),s('process'))}</FG><FG label="Key process steps">{fa(f('steps'),s('steps'),4)}</FG></>,
    scar: <><R2><FG label="Supplier">{fi(f('supplier'),s('supplier'))}</FG><FG label="Due date">{fi(f('due'),s('due'))}</FG></R2><FG label="Nonconformance description">{fa(f('problem'),s('problem'),4)}</FG></>,
    dev: <><FG label="Deviation description">{fa(f('description'),s('description'),4)}</FG><R2><FG label="Qty affected">{fi(f('qty'),s('qty'))}</FG><FG label="Requested by">{fi(f('requestor'),s('requestor'))}</FG></R2></>,
    imds: <><FG label="Materials / substances">{fa(f('materials'),s('materials'),3)}</FG><FG label="Scope">{fs(f('scope'),s('scope'),['Full RoHS + REACH + CMRT','IMDS only','REACH only'])}</FG></>,
    qmp: <><FG label="Program / product">{fi(f('program'),s('program'))}</FG><FG label="Standard">{fs(f('standard'),s('standard'),['AS9145 (APQP)','ISO 9001:2015','IATF 16949'])}</FG><FG label="Quality objectives">{fa(f('objectives'),s('objectives'))}</FG></>,
  }
  return forms[docId] || null
}

function DocOutput({ docId, content }) {
  const lines = content.split('\n')
  return (
    <div style={{ fontFamily:'monospace', fontSize:11, lineHeight:1.8, color:'rgba(255,255,255,.85)' }}>
      {lines.map((line,i) => {
        const t = line.trim()
        if (!t) return <br key={i} />
        if (t.startsWith('===') && t.endsWith('===')) {
          return <div key={i} style={{ color:C.skyLt, fontWeight:700, marginTop:10, marginBottom:3, fontSize:12 }}>{t.replace(/^===\s*/,'').replace(/\s*===$/,'')}</div>
        }
        const html = t.replace(/✓ PASS/g,`<span style="color:${C.mint}">✓ PASS</span>`).replace(/✗ FAIL/g,`<span style="color:${C.coral}">✗ FAIL</span>`).replace(/⚠ WARNING:/g,`<span style="color:${C.amber}">⚠ WARNING:</span>`).replace(/⚠/g,`<span style="color:${C.amber}">⚠</span>`)
        return <div key={i} style={{ marginBottom:1 }} dangerouslySetInnerHTML={{ __html: html }} />
      })}
    </div>
  )
}

export default function DocStudio() {
  const { org, user } = useAuth()
  const [activeDoc, setActiveDoc] = useState('coc')
  const [fields, setFields] = useState(() => { const r={}; DOCS.forEach(d=>{r[d.id]={...DEFAULTS[d.id]}}); return r })
  const [messages, setMessages] = useState([{ role:'ai', type:'welcome' }])
  const [inputVal, setInputVal] = useState('')
  const [busy, setBusy] = useState(false)
  const [emailModal, setEmailModal] = useState(null) // { docId, content, docNumber }
  const [emailTo, setEmailTo] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailResult, setEmailResult] = useState('')
  const msgsRef = useRef(null)

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight }, [messages])

  function setField(k,v) { setFields(prev => ({ ...prev, [activeDoc]: { ...prev[activeDoc], [k]:v } })) }

  function buildPrompt(docId, F) {
    const prompts = {
      coc:`Generate a Certificate of Compliance (COC) for:\nPart: ${F.pn} ${F.rev} | Customer: ${F.customer} | PO: ${F.po}\nLot: ${F.lot} | Qty: ${F.qty} | Ship: ${F.date}\nStandards: ${F.standards}\nSpecial processes: ${F.process}\nRemarks: ${F.remarks}`,
      coa:`Generate a Certificate of Analysis (COA):\nMaterial: ${F.material} | Heat: ${F.heat} | Supplier: ${F.supplier} | Cert: ${F.cert}\nSpec: ${F.spec}\nRequired: ${F.required}\nActual results: ${F.actual}\nEvaluate each result vs spec with ✓ PASS or ✗ FAIL.`,
      coo:`Generate a Certificate of Origin (COO):\nExporter: ${F.exporter} | Origin: ${F.origin}\nConsignee: ${F.consignee} | HTS: ${F.hts} | Agreement: ${F.agreement}`,
      psw:`Generate an AIAG PPAP Part Submission Warrant:\nPart: ${F.pn} | Customer: ${F.customer} | Level: ${F.level} | Reason: ${F.reason}\nElements completed: ${F.elements}\nValidate ALL 18 AIAG elements, flag missing ones with ⚠ WARNING:`,
      fair:`Generate an AS9102 FAIR:\nPart: ${F.pn} | Drawing: ${F.drawing}\nMeasurements: ${F.measurements}\nEvaluate all characteristics as ✓ PASS or ✗ FAIL.`,
      mtr:`Generate a Material Test Report:\nMaterial: ${F.material} | Heat: ${F.heat} | Spec: ${F.spec} | Supplier: ${F.supplier}`,
      '8d':`Generate a complete 8D Corrective Action Report:\nProblem: ${F.problem}\nNCR: ${F.ncr} | Team: ${F.team}\nInclude all 8 disciplines. D4 must include a full 5-Why root cause analysis.`,
      pfmea:`Generate an AIAG/VDA Process FMEA:\nProcess: ${F.process}\nSteps: ${F.steps}\nInclude S/O/D ratings and Action Priority.`,
      scar:`Generate a Supplier Corrective Action Request:\nSupplier: ${F.supplier} | Due: ${F.due}\nProblem: ${F.problem}`,
      dev:`Generate a Deviation / Waiver Request:\nDescription: ${F.description}\nQty: ${F.qty} | Requested by: ${F.requestor}`,
      imds:`Generate an IMDS/REACH Compliance Report:\nMaterials: ${F.materials}\nScope: ${F.scope}`,
      qmp:`Generate a Quality Management Plan:\nProgram: ${F.program} | Standard: ${F.standard}\nObjectives: ${F.objectives}`,
    }
    return prompts[docId] || `Generate a ${docId.toUpperCase()} document.`
  }

  async function callAI(text) {
    const system = `You are QMS Pro AI — expert compliance document generator for ISO 9001:2015, IATF 16949, AS9145 manufacturers. Company: ${org?.name||'Manufacturer'} | CAGE: ${org?.cage_code||'N/A'} | ISO Cert: ${org?.iso_cert||'N/A'} | IATF Cert: ${org?.iatf_cert||'N/A'} | Signatory: ${org?.quality_manager||'Quality Manager'}. Structure with === SECTION === headers. Use ✓ PASS, ✗ FAIL, ⚠ WARNING: markers. Reference standard clauses. End with === AI REVIEW NOTES ===.`
    const res = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ system, userContent: text }) })
    if (!res.ok) { const e = await res.json(); throw new Error(e.error||'API error') }
    const data = await res.json()
    if (!data.text) throw new Error('Empty response')
    return data.text
  }

  async function saveDocument(docId, content, docNumber) {
    if (!org?.id) return
    const F = fields[docId]
    const doc = DOCS.find(d=>d.id===docId)
    await supabase.from('documents').insert({
      org_id: org.id, created_by: user?.id,
      doc_type: docId, doc_number: docNumber,
      title: doc?.name, content,
      fields: F, status: 'draft',
      customer: F?.customer||F?.supplier||'',
      part_number: F?.pn||F?.material||'',
      lot_number: F?.lot||F?.heat||'',
    })
  }

  async function sendMessage(textOverride) {
    if (busy) return
    const text = textOverride || inputVal.trim()
    if (!text) return
    setInputVal('')
    setBusy(true)
    setMessages(prev => [...prev, { role:'user', type:'text', content:text }])

    const lower = text.toLowerCase()
    let docId = activeDoc
    if (lower.includes('psw')||lower.includes('warrant')) docId='psw'
    else if (lower.includes('8d')||lower.includes('ncr-00')||lower.includes('corrective action')) docId='8d'
    else if (lower.includes('coa')||lower.includes('certificate of analysis')) docId='coa'
    else if (lower.includes('coo')||lower.includes('origin')) docId='coo'
    else if (lower.includes('fair')||lower.includes('first article')) docId='fair'
    else if (lower.includes('pfmea')||lower.includes('fmea')) docId='pfmea'
    else if (lower.includes('scar')||lower.includes('supplier corrective')) docId='scar'
    else if (lower.includes('coc')||lower.includes('certificate of compliance')) docId='coc'

    const msgId = Date.now()
    setMessages(prev => [...prev, { role:'ai', type:'thinking', docId, msgId, content:'' }])

    try {
      const resultText = await callAI(text)
      const docNumber = DOC_NUMBERS[docId]
      setMessages(prev => prev.map(m => m.msgId===msgId ? { ...m, type:'doc', content:resultText, docNumber } : m))
      saveDocument(docId, resultText, docNumber)
    } catch(err) {
      setMessages(prev => prev.map(m => m.msgId===msgId ? { ...m, type:'error', content:err.message } : m))
    }
    setBusy(false)
  }

  async function handleExportPDF(docId, content, docNumber) {
    await exportDocumentPDF({ docType:docId, docNumber, content, company:org||{} })
  }

  async function handleSendEmail() {
    if (!emailModal || !emailTo.trim()) return
    setEmailSending(true)
    setEmailResult('')
    try {
      const res = await fetch('/api/email/send', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ to:emailTo.trim(), docType:emailModal.docId, docNumber:emailModal.docNumber, content:emailModal.content, companyName:org?.name, senderName:org?.quality_manager }) })
      const data = await res.json()
      if (data.success) { setEmailResult('✓ Email sent successfully'); setTimeout(()=>{ setEmailModal(null); setEmailResult(''); setEmailTo('') }, 2000) }
      else setEmailResult('✗ ' + (data.error||'Send failed'))
    } catch(e) { setEmailResult('✗ ' + e.message) }
    setEmailSending(false)
  }

  const CHIPS = [
    { label:'COC for Ford →', msg:'Generate a Certificate of Compliance for part 8841-JKL Rev C, lot A44-222, 500 PCS shipped to Ford Motor Company.' },
    { label:'Level 3 PSW →', msg:'Create a Level 3 PPAP Part Submission Warrant for part 8841-JKL and validate all 18 AIAG elements.' },
    { label:'8D NCR-0045 →', msg:'Draft a complete 8D corrective action report for NCR-0045: zinc plating 0.00031" vs 0.0005" min per ASTM B633.' },
    { label:'COA with eval →', msg:'Generate a COA for AISI 4140 heat HT-44912-B. Evaluate: UTS 102 ksi, YS 87 ksi, Elong 21%, Hardness 31 HRC.' },
    { label:'PPAP gaps →', msg:'What PPAP elements are missing for part 8841-JKL Level 3? Completed: 1,2,3,4,5,6,7,8,9,10,11,12,14,16' },
  ]

  return (
    <div style={{ flex:1, display:'flex', overflow:'hidden', fontFamily:'system-ui,sans-serif', color:'#fff' }}>

      {/* Sidebar doc type picker */}
      <div style={{ width:220, minWidth:220, borderRight:`1px solid ${C.border}`, background:C.navyMid, overflowY:'auto', display:'flex', flexDirection:'column' }}>
        <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'.08em', color:'rgba(255,255,255,.28)', padding:'12px 14px 4px', fontWeight:500 }}>Document type</div>
        {DOCS.map(doc => (
          <button key={doc.id} onClick={()=>setActiveDoc(doc.id)}
            style={{ display:'flex', alignItems:'center', gap:9, width:'100%', padding:'8px 12px', border:'none', background:activeDoc===doc.id?'rgba(74,144,217,.14)':'none', color:activeDoc===doc.id?C.skyLt:'rgba(255,255,255,.6)', fontSize:12, fontFamily:'inherit', cursor:'pointer', textAlign:'left', borderLeft:`3px solid ${activeDoc===doc.id?C.sky:'transparent'}`, transition:'.12s' }}>
            <div style={{ width:26,height:26,borderRadius:5,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,fontFamily:'monospace',background:doc.bg,color:doc.color,flexShrink:0 }}>{doc.label}</div>
            {doc.name}
          </button>
        ))}
      </div>

      {/* Form */}
      <div style={{ width:300, minWidth:300, borderRight:`1px solid ${C.border}`, padding:14, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, background:C.navy }}>
        {(() => { const doc=DOCS.find(d=>d.id===activeDoc); return <>
          <div style={{ fontSize:13,fontWeight:500,marginBottom:2,display:'flex',alignItems:'center',gap:7 }}>
            <span style={{ background:doc.bg,color:doc.color,borderRadius:4,padding:'2px 8px',fontSize:10,fontFamily:'monospace' }}>{doc.label}</span>
            {doc.name}
          </div>
          <div style={{ fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:8 }}>{doc.std}</div>
        </> })()}
        <FormFields docId={activeDoc} fields={fields[activeDoc]} setField={setField} />
        <button onClick={() => sendMessage(buildPrompt(activeDoc, fields[activeDoc]))} disabled={busy}
          style={{ width:'100%',padding:'9px 0',background:busy?'rgba(74,144,217,.4)':C.sky,border:'none',borderRadius:8,color:'#fff',fontSize:13,fontWeight:600,fontFamily:'inherit',cursor:busy?'not-allowed':'pointer',marginTop:4 }}>
          ✦ Generate with AI
        </button>
        <button onClick={()=>document.getElementById('chat-input')?.focus()}
          style={{ width:'100%',padding:'7px 0',background:'transparent',border:`1px solid rgba(74,144,217,.3)`,borderRadius:8,color:C.skyLt,fontSize:12,fontFamily:'inherit',cursor:'pointer' }}>
          💬 Chat with AI
        </button>
      </div>

      {/* Chat */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:C.navy }}>
        <div style={{ padding:'9px 14px', borderBottom:`1px solid ${C.border}`, background:C.navyMid, flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:12,fontWeight:500,color:C.skyLt }}>AI Document Assistant</span>
          <span style={{ flex:1 }} />
          <span style={{ fontSize:10,fontFamily:'monospace',color:'rgba(255,255,255,.25)' }}>Claude Sonnet · {org?.name||'QMS Pro'}</span>
        </div>

        <div ref={msgsRef} style={{ flex:1, overflowY:'auto', scrollbarWidth:'thin' }}>
          {messages.map((msg,i) => {
            if (msg.type==='welcome') return (
              <div key={i} style={{ display:'flex',gap:9,padding:'14px 14px',borderBottom:`1px solid rgba(74,144,217,.07)` }}>
                <div style={{ width:26,height:26,borderRadius:5,background:'rgba(74,144,217,.18)',color:C.skyLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,fontFamily:'monospace' }}>AI</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'.07em',color:C.skyLt,marginBottom:4,fontWeight:500 }}>QMS AI Assistant</div>
                  <div style={{ fontSize:12,lineHeight:1.65,color:'rgba(255,255,255,.85)' }}>
                    <p style={{ marginBottom:8 }}>Hello, {org?.name ? `${org.name}` : 'welcome'}! I can generate any compliance document — pick a type on the left and click <strong>Generate</strong>, or describe what you need below.</p>
                    <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginTop:8 }}>
                      {CHIPS.map((c,j)=>(
                        <button key={j} onClick={()=>sendMessage(c.msg)} style={{ display:'inline-flex',alignItems:'center',gap:4,background:'rgba(74,144,217,.1)',border:`1px solid rgba(74,144,217,.28)`,borderRadius:20,padding:'4px 10px',fontSize:11,color:C.skyLt,cursor:'pointer',fontFamily:'inherit' }}>{c.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
            if (msg.role==='user') return (
              <div key={i} style={{ display:'flex',gap:9,padding:'12px 14px',borderBottom:`1px solid rgba(74,144,217,.07)` }}>
                <div style={{ width:26,height:26,borderRadius:5,background:'rgba(0,196,160,.14)',color:C.mint,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,fontFamily:'monospace' }}>You</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'.07em',color:C.mint,marginBottom:4,fontWeight:500 }}>You</div>
                  <div style={{ fontSize:12,lineHeight:1.65,color:'rgba(255,255,255,.85)' }}>{msg.content}</div>
                </div>
              </div>
            )
            if (msg.type==='thinking'&&!msg.content) return (
              <div key={i} style={{ display:'flex',gap:9,padding:'12px 14px' }}>
                <div style={{ width:26,height:26,borderRadius:5,background:'rgba(74,144,217,.18)',color:C.skyLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,fontFamily:'monospace' }}>AI</div>
                <div style={{ paddingTop:4,display:'flex',alignItems:'center',gap:8,fontSize:12,color:'rgba(255,255,255,.4)' }}>
                  Generating document…
                  <span style={{ display:'flex',gap:4 }}>{[0,.2,.4].map((d,k)=><span key={k} style={{ width:5,height:5,borderRadius:'50%',background:C.sky,opacity:.35,animation:`blink 1.2s ${d}s infinite` }} />)}</span>
                </div>
              </div>
            )
            if (msg.type==='error') return (
              <div key={i} style={{ display:'flex',gap:9,padding:'12px 14px' }}>
                <div style={{ width:26,height:26,borderRadius:5,background:'rgba(74,144,217,.18)',color:C.skyLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,fontFamily:'monospace' }}>AI</div>
                <div style={{ padding:'10px 14px',background:'rgba(232,98,82,.1)',border:'1px solid rgba(232,98,82,.25)',borderRadius:8,fontSize:12,color:C.coral }}>
                  ✗ Error: {msg.content}<br /><span style={{ fontSize:11,color:'rgba(255,255,255,.35)' }}>Check that ANTHROPIC_API_KEY is set in Vercel → Settings → Environment Variables</span>
                </div>
              </div>
            )
            if (msg.type==='doc'&&msg.content) return (
              <div key={i} style={{ display:'flex',gap:9,padding:'12px 14px',borderBottom:`1px solid rgba(74,144,217,.07)` }}>
                <div style={{ width:26,height:26,borderRadius:5,background:'rgba(74,144,217,.18)',color:C.skyLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,fontFamily:'monospace' }}>AI</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'.07em',color:C.skyLt,marginBottom:8,fontWeight:500 }}>QMS AI Assistant</div>
                  <div style={{ background:'rgba(0,0,0,.25)',border:`1px solid rgba(74,144,217,.22)`,borderRadius:9,overflow:'hidden',marginBottom:10 }}>
                    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',borderBottom:`1px solid rgba(74,144,217,.16)`,background:'rgba(11,31,58,.5)' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                        <span style={{ fontFamily:'monospace',fontSize:11,fontWeight:600,color:C.skyLt }}>{msg.docNumber||msg.docId?.toUpperCase()}</span>
                        <span style={{ fontSize:10,color:'rgba(255,255,255,.3)' }}>AI Generated · Auto-saved</span>
                      </div>
                      <div style={{ display:'flex',gap:6 }}>
                        <button onClick={()=>navigator.clipboard.writeText(msg.content).catch(()=>{})} style={{ padding:'3px 8px',background:'transparent',border:`1px solid rgba(74,144,217,.3)`,borderRadius:5,color:C.skyLt,fontSize:10,cursor:'pointer',fontFamily:'inherit' }}>Copy</button>
                        <button onClick={()=>handleExportPDF(msg.docId||activeDoc,msg.content,msg.docNumber)} style={{ padding:'3px 8px',background:'rgba(0,196,160,.15)',border:'1px solid rgba(0,196,160,.3)',borderRadius:5,color:C.mint,fontSize:10,cursor:'pointer',fontFamily:'inherit' }}>Export PDF</button>
                        <button onClick={()=>setEmailModal({docId:msg.docId||activeDoc,content:msg.content,docNumber:msg.docNumber})} style={{ padding:'3px 8px',background:'rgba(74,144,217,.15)',border:`1px solid rgba(74,144,217,.3)`,borderRadius:5,color:C.skyLt,fontSize:10,cursor:'pointer',fontFamily:'inherit' }}>Email →</button>
                      </div>
                    </div>
                    <div style={{ padding:12,maxHeight:340,overflowY:'auto',scrollbarWidth:'thin' }}>
                      <DocOutput docId={msg.docId||activeDoc} content={msg.content} />
                    </div>
                  </div>
                  <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                    <button onClick={()=>sendMessage('Make this more formal and add more specific clause references')} style={{ padding:'4px 9px',background:'transparent',border:`1px solid rgba(74,144,217,.28)`,borderRadius:6,color:C.skyLt,fontSize:11,cursor:'pointer',fontFamily:'inherit' }}>More formal</button>
                    <button onClick={()=>sendMessage('Add a detailed risk assessment section')} style={{ padding:'4px 9px',background:'transparent',border:`1px solid rgba(74,144,217,.28)`,borderRadius:6,color:C.skyLt,fontSize:11,cursor:'pointer',fontFamily:'inherit' }}>Add risk section</button>
                    <button onClick={()=>sendMessage('What audit pitfalls should I watch for with this document?')} style={{ padding:'4px 9px',background:'transparent',border:`1px solid rgba(74,144,217,.28)`,borderRadius:6,color:C.skyLt,fontSize:11,cursor:'pointer',fontFamily:'inherit' }}>Audit pitfalls</button>
                  </div>
                </div>
              </div>
            )
            return null
          })}
        </div>

        <div style={{ display:'flex',gap:8,padding:'10px 14px',borderTop:`1px solid ${C.border}`,background:C.navyMid,flexShrink:0 }}>
          <input id="chat-input" value={inputVal} onChange={e=>setInputVal(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()} }}
            placeholder="Ask AI to generate, edit, or review any compliance document…"
            style={{ flex:1,background:'rgba(11,31,58,.8)',border:`1px solid rgba(74,144,217,.28)`,borderRadius:7,color:'#fff',fontFamily:'inherit',fontSize:12,padding:'8px 12px',outline:'none' }} />
          <button onClick={()=>sendMessage()} disabled={busy} style={{ padding:'8px 16px',background:busy?'rgba(74,144,217,.4)':C.sky,border:'none',borderRadius:7,color:'#fff',fontSize:12,fontWeight:500,fontFamily:'inherit',cursor:busy?'not-allowed':'pointer' }}>Send</button>
        </div>
      </div>

      {/* Email modal */}
      {emailModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100 }}>
          <div style={{ background:C.navyMid,border:`1px solid ${C.border}`,borderRadius:12,padding:24,width:420,maxWidth:'95vw' }}>
            <div style={{ fontSize:14,fontWeight:600,marginBottom:16 }}>📧 Email Document</div>
            <div style={{ fontSize:11,textTransform:'uppercase',letterSpacing:'.07em',color:'rgba(255,255,255,.4)',marginBottom:5,fontWeight:500 }}>Recipient email(s)</div>
            <input value={emailTo} onChange={e=>setEmailTo(e.target.value)} placeholder="customer@company.com, supplier@vendor.com"
              style={{ width:'100%',background:'rgba(11,31,58,.8)',border:`1px solid rgba(74,144,217,.3)`,borderRadius:7,color:'#fff',fontFamily:'inherit',fontSize:13,padding:'9px 12px',outline:'none',boxSizing:'border-box',marginBottom:16 }} />
            {emailResult && <div style={{ marginBottom:12,fontSize:12,color:emailResult.startsWith('✓')?C.mint:C.coral }}>{emailResult}</div>}
            <div style={{ display:'flex',gap:8,justifyContent:'flex-end' }}>
              <button onClick={()=>{ setEmailModal(null); setEmailTo(''); setEmailResult('') }} style={{ padding:'8px 16px',background:'transparent',border:`1px solid rgba(74,144,217,.3)`,borderRadius:7,color:C.skyLt,fontSize:12,fontFamily:'inherit',cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSendEmail} disabled={emailSending||!emailTo.trim()} style={{ padding:'8px 16px',background:C.sky,border:'none',borderRadius:7,color:'#fff',fontSize:12,fontWeight:600,fontFamily:'inherit',cursor:'pointer' }}>
                {emailSending?'Sending…':'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes blink{0%,100%{opacity:.35}50%{opacity:1}}`}</style>
    </div>
  )
}
