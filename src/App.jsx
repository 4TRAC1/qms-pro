import { useState, useRef, useEffect } from "react";

// ─── Palette & design tokens ───────────────────────────────────────────────
const C = {
  navy:    "#0B1F3A",
  navyMid: "#152D50",
  navyLt:  "#1E3D66",
  sky:     "#4A90D9",
  skyLt:   "#7FBCF0",
  mint:    "#00C4A0",
  mintD:   "#00957A",
  amber:   "#F5A623",
  amberD:  "#C4841A",
  coral:   "#E86252",
  gold:    "#D4AF37",
  purple:  "#7F77DD",
  purpleD: "#534AB7",
};

// ─── Document catalogue ────────────────────────────────────────────────────
const DOCS = [
  { id:"coc",   label:"COC",   name:"Certificate of Compliance",   color:C.mint,   bg:"rgba(0,196,160,.14)",  std:"ISO 9001 · IATF · AS9100" },
  { id:"coa",   label:"COA",   name:"Certificate of Analysis",      color:C.skyLt,  bg:"rgba(74,144,217,.14)", std:"ASTM · ASME · AMS" },
  { id:"coo",   label:"COO",   name:"Certificate of Origin",        color:C.gold,   bg:"rgba(212,175,55,.14)", std:"USMCA · CBP · FTA" },
  { id:"psw",   label:"PSW",   name:"Part Submission Warrant",      color:C.purple, bg:"rgba(127,119,221,.14)",std:"AIAG PPAP · AS9145" },
  { id:"fair",  label:"FAIR",  name:"First Article Inspection",     color:C.amber,  bg:"rgba(245,166,35,.14)", std:"AS9102 · Form 1/2/3" },
  { id:"mtr",   label:"MTR",   name:"Material Test Report",         color:C.coral,  bg:"rgba(232,98,82,.14)",  std:"ASTM · AMS · ASME" },
  { id:"8d",    label:"8D",    name:"8D Corrective Action",         color:C.skyLt,  bg:"rgba(74,144,217,.14)", std:"IATF 16949 · AIAG" },
  { id:"pfmea", label:"PFMEA", name:"Process FMEA",                 color:C.coral,  bg:"rgba(232,98,82,.14)",  std:"AIAG/VDA · IATF" },
  { id:"scar",  label:"SCAR",  name:"Supplier Corrective Action",   color:C.amber,  bg:"rgba(245,166,35,.14)", std:"ISO 9001 · IATF" },
  { id:"dev",   label:"DEV",   name:"Deviation / Waiver",           color:C.gold,   bg:"rgba(212,175,55,.14)", std:"AS9100 · ISO 9001" },
  { id:"imds",  label:"IMDS",  name:"IMDS / REACH Report",          color:C.mint,   bg:"rgba(0,196,160,.14)",  std:"REACH · RoHS · CMRT" },
  { id:"qmp",   label:"QMP",   name:"Quality Management Plan",      color:C.purple, bg:"rgba(127,119,221,.14)",std:"ISO 9001 · AS9145" },
];

// ─── Default form fields per doc type ─────────────────────────────────────
const DEFAULTS = {
  coc:   { pn:"8841-JKL", rev:"Rev C", customer:"Ford Motor Company", po:"PO-2026-00441", lot:"A44-222", qty:"500 PCS", date:"2026-01-14", standards:"ISO 9001:2015, IATF 16949:2016, Customer Drawing Rev C", process:"Zinc plating per ASTM B633, Type II", remarks:"None. All characteristics conform to drawing and customer requirements." },
  coa:   { material:"AISI 4140 Alloy Steel", heat:"HT-44912-B", supplier:"AcmeSteel Corp.", cert:"MC-20260108-3", spec:"ASTM A29 / AMS 6349", required:"UTS ≥ 95 ksi, YS ≥ 80 ksi, Elongation ≥ 18%, Hardness 28-34 HRC, Carbon 0.38-0.43%", actual:"UTS: 102 ksi, YS: 87 ksi, Elong: 21%, Hardness: 31 HRC, C: 0.40%" },
  coo:   { exporter:"Acme Manufacturing LLC", origin:"United States", consignee:"Ford Motor Co., Germany", hts:"8708.99.8180", agreement:"USMCA" },
  psw:   { pn:"8841-JKL", customer:"Ford Motor Co.", level:"Level 3", reason:"Initial submission", elements:"1,2,3,4,5,6,7,8,9,10,11,12,14,16" },
  fair:  { pn:"9912-AAX", drawing:"DWG-9912-AAX Rev B", measurements:"Dia 12.35±0.05: 12.37 | Depth 8.00±0.10: 8.04 | Thread M12x1.25: PASS | Surface 1.6Ra: 1.4Ra | Hardness 28-34 HRC: 31 HRC" },
  mtr:   { material:"AISI 4140", heat:"HT-44912-B", spec:"ASTM A29 / AMS 6349", supplier:"AcmeSteel Corp." },
  "8d":  { problem:"Zinc plating 0.00031\" measured vs 0.0005\" minimum per ASTM B633, Type II. Lot A44-219, 240 lbs. Found at incoming inspection.", ncr:"NCR-0045", team:"J. Martinez (Lead), K. Lee, T. Brown (QE), Supplier Rep." },
  pfmea: { process:"CNC Turning — Diameter Feature D7", steps:"1. Load blank. 2. Rough turn OD. 3. Finish turn 12.35±0.05mm. 4. Part-off. 5. Deburr. 6. 100% gauge inspection." },
  scar:  { supplier:"AcmeSteel Corp.", due:"2026-01-25", problem:"Wrong revision received. Rev B delivered, Rev C required per ECN-0841. 240 lbs affected, PO-2026-00398." },
  dev:   { description:"Surface roughness 2.1 Ra measured vs 1.6 Ra max. Functional analysis confirms no impact on sealing performance.", qty:"25 PCS", requestor:"Engineering" },
  imds:  { materials:"AISI 4140 steel, Zinc plating (ASTM B633), Trivalent chromate conversion coating", scope:"Full RoHS + REACH + CMRT" },
  qmp:   { program:"Program 4471-A Bracket Assembly", standard:"AS9145 (APQP)", objectives:"Zero PPM at customer, Cpk ≥ 1.67 critical features, PPAP Level 3 by Mar 2026." },
};

const DOC_NUMBERS = {
  coc:"COC-2026-0143", coa:"COA-2026-0090", coo:"COO-2026-0032",
  psw:"PSW-8841-L3", fair:"FAIR-9912-B", mtr:"MTR-4140-B",
  "8d":"8D-NCR-0045", pfmea:"PFMEA-CNC-D7", scar:"SCAR-2026-0018",
  dev:"DEV-2026-0009", imds:"IMDS-2026-0041", qmp:"QMP-4471-A",
};

// ─── Inline styles ─────────────────────────────────────────────────────────
const S = {
  app:      { fontFamily:"'DM Sans',system-ui,sans-serif", background:C.navy, color:"#fff", minHeight:"100vh", display:"flex", flexDirection:"column", fontSize:14 },
  topbar:   { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", background:C.navyMid, borderBottom:`1px solid rgba(74,144,217,.18)`, flexShrink:0 },
  logoPill: { background:C.sky, borderRadius:6, padding:"3px 10px", fontSize:12, fontWeight:700, letterSpacing:".05em", fontFamily:"monospace" },
  tabs:     { display:"flex", gap:2 },
  body:     { display:"flex", flex:1, overflow:"hidden", minHeight:0 },
  sidebar:  { width:240, minWidth:240, borderRight:`1px solid rgba(74,144,217,.15)`, background:C.navyMid, overflowY:"auto", display:"flex", flexDirection:"column" },
  main:     { flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 },
  formSide: { width:320, minWidth:320, borderRight:`1px solid rgba(74,144,217,.12)`, padding:14, overflowY:"auto", display:"flex", flexDirection:"column", gap:10 },
  chatSide: { flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 },
  chatMsgs: { flex:1, overflowY:"auto", padding:0 },
  chatBar:  { display:"flex", gap:8, padding:"10px 14px", borderTop:`1px solid rgba(74,144,217,.13)`, background:C.navyMid, flexShrink:0 },
  card:     { background:C.navyMid, border:`1px solid rgba(74,144,217,.16)`, borderRadius:10, padding:14 },
};

function fl(label) {
  return <label style={{ display:"block", fontSize:10, textTransform:"uppercase", letterSpacing:".07em", color:"rgba(255,255,255,.38)", marginBottom:4, fontWeight:500 }}>{label}</label>;
}

function Fi({ value, onChange, type="text", placeholder="" }) {
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{ width:"100%", background:"rgba(11,31,58,.75)", border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:"#fff", fontFamily:"inherit", fontSize:12, padding:"7px 10px", outline:"none", boxSizing:"border-box" }} />;
}

function FiSel({ value, onChange, options }) {
  return <select value={value} onChange={e=>onChange(e.target.value)}
    style={{ width:"100%", background:"#152D50", border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:"#fff", fontFamily:"inherit", fontSize:12, padding:"7px 10px", outline:"none", boxSizing:"border-box", appearance:"none" }}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>;
}

function FiTa({ value, onChange, rows=3 }) {
  return <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows}
    style={{ width:"100%", background:"rgba(11,31,58,.75)", border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:"#fff", fontFamily:"inherit", fontSize:12, padding:"7px 10px", outline:"none", resize:"vertical", lineHeight:1.5, boxSizing:"border-box" }} />;
}

function Btn({ children, onClick, style={}, variant="blue" }) {
  const bases = {
    blue:   { background:C.sky, color:"#fff" },
    green:  { background:C.mintD, color:"#fff" },
    ghost:  { background:"transparent", border:`1px solid rgba(74,144,217,.32)`, color:C.skyLt },
    amber:  { background:C.amberD, color:"#fff" },
    purple: { background:C.purpleD, color:"#fff" },
  };
  return <button onClick={onClick}
    style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"7px 13px", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer", border:"none", fontFamily:"inherit", ...bases[variant], ...style }}>
    {children}
  </button>;
}

// ─── Form panels ───────────────────────────────────────────────────────────
function FormPanel({ docId, fields, setField }) {
  const f = (k) => fields[k] || "";
  const s = (k) => (v) => setField(k, v);
  const R2 = ({ children }) => <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>{children}</div>;
  const FG = ({ label, children }) => <div style={{ marginBottom:9 }}>{fl(label)}{children}</div>;

  const panels = {
    coc: <>
      <FG label="Part number"><Fi value={f("pn")} onChange={s("pn")} /></FG>
      <R2><FG label="Revision"><Fi value={f("rev")} onChange={s("rev")} /></FG><FG label="Customer"><Fi value={f("customer")} onChange={s("customer")} /></FG></R2>
      <R2><FG label="PO number"><Fi value={f("po")} onChange={s("po")} /></FG><FG label="Lot / Batch"><Fi value={f("lot")} onChange={s("lot")} /></FG></R2>
      <R2><FG label="Qty shipped"><Fi value={f("qty")} onChange={s("qty")} /></FG><FG label="Ship date"><Fi value={f("date")} onChange={s("date")} type="date" /></FG></R2>
      <FG label="Applicable standards"><Fi value={f("standards")} onChange={s("standards")} /></FG>
      <FG label="Special processes"><Fi value={f("process")} onChange={s("process")} /></FG>
      <FG label="Remarks / deviations"><FiTa value={f("remarks")} onChange={s("remarks")} /></FG>
    </>,
    coa: <>
      <R2><FG label="Material spec"><Fi value={f("material")} onChange={s("material")} /></FG><FG label="Heat number"><Fi value={f("heat")} onChange={s("heat")} /></FG></R2>
      <R2><FG label="Supplier"><Fi value={f("supplier")} onChange={s("supplier")} /></FG><FG label="Mill cert #"><Fi value={f("cert")} onChange={s("cert")} /></FG></R2>
      <FG label="ASTM / AMS spec"><Fi value={f("spec")} onChange={s("spec")} /></FG>
      <FG label="Required properties"><FiTa value={f("required")} onChange={s("required")} /></FG>
      <FG label="Actual test results (AI evaluates vs spec)"><FiTa value={f("actual")} onChange={s("actual")} /></FG>
    </>,
    coo: <>
      <R2><FG label="Exporter"><Fi value={f("exporter")} onChange={s("exporter")} /></FG><FG label="Country of origin"><Fi value={f("origin")} onChange={s("origin")} /></FG></R2>
      <R2><FG label="Consignee"><Fi value={f("consignee")} onChange={s("consignee")} /></FG><FG label="HTS code"><Fi value={f("hts")} onChange={s("hts")} /></FG></R2>
      <FG label="Trade agreement"><FiSel value={f("agreement")} onChange={s("agreement")} options={["USMCA","EU-US (TATIP draft)","General / None"]} /></FG>
    </>,
    psw: <>
      <R2><FG label="Part number"><Fi value={f("pn")} onChange={s("pn")} /></FG><FG label="Customer"><Fi value={f("customer")} onChange={s("customer")} /></FG></R2>
      <R2><FG label="Submission level"><FiSel value={f("level")} onChange={s("level")} options={["Level 1","Level 2","Level 3","Level 4","Level 5"]} /></FG><FG label="Submission reason"><FiSel value={f("reason")} onChange={s("reason")} options={["Initial submission","Engineering change","Tooling transfer","Annual re-validation"]} /></FG></R2>
      <FG label="Elements complete (AI validates all 18)"><FiTa value={f("elements")} onChange={s("elements")} rows={2} /></FG>
    </>,
    fair: <>
      <R2><FG label="Part number"><Fi value={f("pn")} onChange={s("pn")} /></FG><FG label="Drawing number / rev"><Fi value={f("drawing")} onChange={s("drawing")} /></FG></R2>
      <FG label="Measured characteristics (balloon # : nominal : actual)"><FiTa value={f("measurements")} onChange={s("measurements")} rows={4} /></FG>
    </>,
    mtr: <>
      <R2><FG label="Material"><Fi value={f("material")} onChange={s("material")} /></FG><FG label="Heat number"><Fi value={f("heat")} onChange={s("heat")} /></FG></R2>
      <FG label="ASTM / AMS spec"><Fi value={f("spec")} onChange={s("spec")} /></FG>
      <FG label="Supplier"><Fi value={f("supplier")} onChange={s("supplier")} /></FG>
    </>,
    "8d": <>
      <FG label="Problem statement"><FiTa value={f("problem")} onChange={s("problem")} rows={4} /></FG>
      <R2><FG label="NCR number"><Fi value={f("ncr")} onChange={s("ncr")} /></FG><FG label="Team members"><Fi value={f("team")} onChange={s("team")} /></FG></R2>
    </>,
    pfmea: <>
      <FG label="Process / operation name"><Fi value={f("process")} onChange={s("process")} /></FG>
      <FG label="Key process steps"><FiTa value={f("steps")} onChange={s("steps")} rows={4} /></FG>
    </>,
    scar: <>
      <R2><FG label="Supplier name"><Fi value={f("supplier")} onChange={s("supplier")} /></FG><FG label="Response due date"><Fi value={f("due")} onChange={s("due")} type="date" /></FG></R2>
      <FG label="Nonconformance description"><FiTa value={f("problem")} onChange={s("problem")} rows={4} /></FG>
    </>,
    dev: <>
      <FG label="Deviation description"><FiTa value={f("description")} onChange={s("description")} rows={4} /></FG>
      <R2><FG label="Quantity affected"><Fi value={f("qty")} onChange={s("qty")} /></FG><FG label="Requested by"><Fi value={f("requestor")} onChange={s("requestor")} /></FG></R2>
    </>,
    imds: <>
      <FG label="Materials / substances"><FiTa value={f("materials")} onChange={s("materials")} rows={3} /></FG>
      <FG label="Directive scope"><FiSel value={f("scope")} onChange={s("scope")} options={["Full RoHS + REACH + CMRT","IMDS submission only","REACH declaration only"]} /></FG>
    </>,
    qmp: <>
      <FG label="Program / product name"><Fi value={f("program")} onChange={s("program")} /></FG>
      <FG label="Applicable standard"><FiSel value={f("standard")} onChange={s("standard")} options={["AS9145 (APQP)","ISO 9001:2015","IATF 16949"]} /></FG>
      <FG label="Quality objectives"><FiTa value={f("objectives")} onChange={s("objectives")} rows={3} /></FG>
    </>,
  };

  const doc = DOCS.find(d=>d.id===docId);
  return <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
    <div style={{ fontSize:14, fontWeight:500, marginBottom:3, display:"flex", alignItems:"center", gap:7 }}>
      <span style={{ background:doc.bg, color:doc.color, borderRadius:4, padding:"2px 8px", fontSize:10, fontFamily:"monospace" }}>{doc.label}</span>
      {doc.name}
    </div>
    <div style={{ fontSize:11, color:"rgba(255,255,255,.38)", marginBottom:12 }}>
      AI generates a compliant document from these inputs using your active standards context.
    </div>
    {panels[docId] || <div style={{ color:"rgba(255,255,255,.4)", fontSize:12 }}>Configure inputs for {doc.name}.</div>}
  </div>;
}

// ─── Chat message ──────────────────────────────────────────────────────────
function ChatMsg({ role, children }) {
  return <div style={{ display:"flex", gap:9, padding:"12px 14px", borderBottom:`1px solid rgba(74,144,217,.07)` }}>
    <div style={{ width:26, height:26, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0, marginTop:1, fontFamily:"monospace", background: role==="ai" ? "rgba(74,144,217,.18)" : "rgba(0,196,160,.14)", color: role==="ai" ? C.skyLt : C.mint }}>
      {role==="ai" ? "AI" : "You"}
    </div>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:".07em", marginBottom:4, fontWeight:500, color: role==="ai" ? C.skyLt : C.mint }}>
        {role==="ai" ? "QMS AI Assistant" : "You"}
      </div>
      <div style={{ fontSize:12, lineHeight:1.65, color:"rgba(255,255,255,.88)" }}>{children}</div>
    </div>
  </div>;
}

// ─── Output document display ───────────────────────────────────────────────
function DocOutput({ docId, content, isStreaming }) {
  const doc = DOCS.find(d=>d.id===docId) || DOCS[0];
  const docNum = DOC_NUMBERS[docId] || "QMS-2026-AUTO";

  const lines = content.split("\n");
  const formatted = lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;
    if (trimmed.startsWith("===") && trimmed.endsWith("===")) {
      const header = trimmed.replace(/^===\s*/, "").replace(/\s*===$/, "");
      return <div key={i} style={{ color:C.skyLt, fontWeight:700, marginTop:10, marginBottom:3, fontSize:12 }}>{header}</div>;
    }
    const withPass = trimmed.replace(/✓ PASS/g, `<span style="color:${C.mint}">✓ PASS</span>`)
      .replace(/✗ FAIL/g, `<span style="color:${C.coral}">✗ FAIL</span>`)
      .replace(/⚠ WARNING:/g, `<span style="color:${C.amber}">⚠ WARNING:</span>`)
      .replace(/⚠/g, `<span style="color:${C.amber}">⚠</span>`);
    return <div key={i} style={{ marginBottom:1 }} dangerouslySetInnerHTML={{ __html: withPass }} />;
  });

  return <div style={{ background:"rgba(0,0,0,.28)", border:`1px solid rgba(74,144,217,.25)`, borderRadius:9, overflow:"hidden", marginTop:10 }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", borderBottom:`1px solid rgba(74,144,217,.18)`, background:"rgba(11,31,58,.6)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:600, color:C.skyLt }}>{docNum}</span>
        <span style={{ fontSize:10, color:"rgba(255,255,255,.35)" }}>{doc.label} · AI Generated</span>
        {isStreaming && <span style={{ fontSize:10, color:C.mint, animation:"none" }}>● streaming…</span>}
      </div>
      <div style={{ display:"flex", gap:6 }}>
        <Btn variant="ghost" onClick={() => navigator.clipboard.writeText(content).catch(()=>{})} style={{ fontSize:11, padding:"3px 8px" }}>Copy</Btn>
        <Btn variant="green" style={{ fontSize:11, padding:"3px 8px" }}>Export PDF</Btn>
      </div>
    </div>
    <div style={{ padding:12, fontFamily:"monospace", fontSize:11, lineHeight:1.8, color:"rgba(255,255,255,.82)", maxHeight:320, overflowY:"auto" }}>
      {formatted}
      {isStreaming && <span style={{ display:"inline-block", width:2, height:13, background:C.sky, marginLeft:2, animation:"blink .8s infinite" }} />}
    </div>
  </div>;
}

// ─── Main app ──────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("gen");
  const [activeDoc, setActiveDoc] = useState("coc");
  const [fields, setFields] = useState(() => {
    const init = {};
    DOCS.forEach(d => { init[d.id] = { ...DEFAULTS[d.id] }; });
    return init;
  });
  const [messages, setMessages] = useState([
    { role:"ai", type:"welcome" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [busy, setBusy] = useState(false);
  const msgsRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  function setField(k, v) {
    setFields(prev => ({ ...prev, [activeDoc]: { ...prev[activeDoc], [k]: v } }));
  }

  function buildPrompt(docId, fieldVals) {
    const d = DOCS.find(x=>x.id===docId);
    const F = fieldVals || {};
    const prompts = {
      coc: `Generate a professional Certificate of Compliance (COC) for:
Part Number: ${F.pn} ${F.rev} | Customer: ${F.customer} | PO: ${F.po}
Lot: ${F.lot} | Quantity: ${F.qty} | Ship Date: ${F.date}
Standards: ${F.standards}
Special Processes: ${F.process}
Remarks/Deviations: ${F.remarks}
Include: document number COC-2026-0143, date, part info section, compliance declaration citing ISO 9001:2015 Clause 8.6, quality verification section, and authorization block.`,

      coa: `Generate a Certificate of Analysis (COA) for:
Material: ${F.material} | Heat Number: ${F.heat} | Supplier: ${F.supplier} | Mill Cert: ${F.cert}
Spec: ${F.spec}
Required Properties: ${F.required}
Actual Test Results: ${F.actual}
Include: chemical and mechanical property tables, evaluate each result vs specification with ✓ PASS or ✗ FAIL, and an overall conformance statement.`,

      coo: `Generate a Certificate of Origin (COO) for:
Exporter: ${F.exporter} | Country of Origin: ${F.origin}
Consignee: ${F.consignee} | HTS Code: ${F.hts} | Trade Agreement: ${F.agreement}
Include: rules-of-origin declaration, product description, exporter certification statement, and any USMCA-specific Article 4.2 language.`,

      psw: `Generate an AIAG PPAP Part Submission Warrant for:
Part Number: ${F.pn} | Customer: ${F.customer} | Submission Level: ${F.level}
Submission Reason: ${F.reason}
Elements completed so far: ${F.elements}
Validate ALL 18 AIAG PPAP elements. For elements 1-18, show ✓ PASS for those in the list above and ⚠ WARNING: INCOMPLETE for those missing. Flag any Cpk requirements, AAR requirements, or CSR gaps. Include an AI REVIEW NOTES section with blocking items before submission.`,

      fair: `Generate an AS9102 Rev C First Article Inspection Report (FAIR) with all three forms:
Part Number: ${F.pn} | Drawing: ${F.drawing}
Measured Characteristics: ${F.measurements}
Form 1: Design Accountability Record. Form 2: Materials and Specifications. Form 3: Characteristic Accountability with each measurement evaluated as ✓ PASS or ✗ FAIL against specification.`,

      mtr: `Generate a Material Test Report (MTR) for:
Material: ${F.material} | Heat Number: ${F.heat} | Spec: ${F.spec} | Supplier: ${F.supplier}
Include: chemical composition table with typical ranges, mechanical properties, heat treatment condition, and certifying statement per ASTM requirements.`,

      "8d": `Generate a complete 8D Corrective Action Report for:
Problem: ${F.problem}
NCR Number: ${F.ncr} | Team: ${F.team}
Include ALL 8 disciplines: D1 Team, D2 Problem Description (Is/Is-Not analysis), D3 Containment Actions (immediate), D4 Root Cause (5-Why analysis), D5 Corrective Actions (permanent), D6 Implementation, D7 Preventive Recurrence, D8 Team Recognition.
Reference IATF 16949 Clause 10.2.3.`,

      pfmea: `Generate an AIAG/VDA Process FMEA for:
Process: ${F.process}
Process Steps: ${F.steps}
Include: Function/Requirements, Failure Mode, Effects of Failure, Severity rating (1-10), Causes of Failure, Occurrence rating (1-10), Current Controls, Detection rating (1-10), Action Priority (AP), and Recommended Actions. Use the AIAG/VDA 1st Edition AP table (H/M/L).`,

      scar: `Generate a Supplier Corrective Action Request (SCAR) for:
Supplier: ${F.supplier} | Response Due: ${F.due}
Nonconformance: ${F.problem}
Include: problem statement, evidence/data, immediate containment required, 8D response required by due date, references to ISO 9001:2015 Clause 8.4, and supplier certification verification requirement.`,

      dev: `Generate a Deviation / Waiver Request for:
Description: ${F.description}
Quantity Affected: ${F.qty} | Requested By: ${F.requestor}
Include: technical justification, risk assessment, quality plan impact, customer approval requirement per ISO 9001:2015 Clause 8.7, and disposition instructions.`,

      imds: `Generate an IMDS / REACH Compliance Report for:
Materials/Substances: ${F.materials}
Scope: ${F.scope}
Include: substance check against REACH SVHC candidate list (current), RoHS Annex II restricted substances evaluation, conflict minerals CMRT assessment, and overall compliance status with recommendations.`,

      qmp: `Generate a Quality Management Plan for:
Program: ${F.program} | Standard: ${F.standard}
Quality Objectives: ${F.objectives}
Include: program scope, quality objectives with SMART criteria, applicable standards and clauses, APQP phase structure (if AS9145), key quality milestones, responsibility matrix, and measurement/monitoring approach.`,
    };
    return prompts[docId] || `Generate a ${d?.name} compliance document based on best practices for ISO 9001:2015 and IATF 16949.`;
  }

  async function callClaude(userContent) {
    const system = `You are QMS Pro AI — an expert quality management system document generator for an ISO 9001:2015, IATF 16949, and AS9145 certified manufacturer called Acme Manufacturing LLC.

Generate precise, professional compliance documents. Always:
- Structure with === SECTION NAME === headers
- Mark passing results: ✓ PASS, failing: ✗ FAIL, issues: ⚠ WARNING:
- Reference specific standard clauses (e.g. ISO 9001:2015 Cl. 8.6)
- For PSW: validate all 18 AIAG elements explicitly
- For 8D: include all 8 disciplines with 5-Why in D4
- For COA: evaluate every test result vs specification
- End with === AI REVIEW NOTES === containing compliance observations and audit pitfall warnings
- Be complete but concise (350-600 words of content)

Company: Acme Manufacturing LLC | CAGE: 3KXB4 | ISO 9001:2015 Cert QM-44912 | IATF 16949 Cert IT-88201 | Authorized Signatory: James Martinez, Quality Manager`;

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system,
        userContent,
      }),
    });

    return response;
  }

  async function sendMessage(textOverride) {
    if (busy) return;
    const text = textOverride || inputVal.trim();
    if (!text) return;
    setInputVal("");
    setBusy(true);

    setMessages(prev => [...prev, { role:"user", type:"text", content: text }]);

    // detect doc type from message
    const lower = text.toLowerCase();
    let docId = activeDoc;
    if (lower.includes("psw") || lower.includes("warrant") || lower.includes("ppap element")) docId = "psw";
    else if (lower.includes("8d") || (lower.includes("corrective") && lower.includes("plating"))) docId = "8d";
    else if (lower.includes("coa") || (lower.includes("analysis") && lower.includes("material"))) docId = "coa";
    else if (lower.includes("coo") || lower.includes("origin")) docId = "coo";
    else if (lower.includes("fair") || lower.includes("first article")) docId = "fair";
    else if (lower.includes("pfmea") || lower.includes("fmea")) docId = "pfmea";
    else if (lower.includes("scar") || (lower.includes("supplier") && lower.includes("corrective"))) docId = "scar";
    else if (lower.includes("coc") || lower.includes("certificate of compliance")) docId = "coc";

    // Add streaming placeholder
    const streamId = Date.now();
    setMessages(prev => [...prev, { role:"ai", type:"streaming", docId, streamId, content: "" }]);

    try {
      const response = await callClaude(text);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                accumulated += parsed.delta.text;
                setMessages(prev => prev.map(m =>
                  m.streamId === streamId ? { ...m, content: accumulated } : m
                ));
              }
            } catch {}
          }
        }
      }

      // Finalize
      setMessages(prev => prev.map(m =>
        m.streamId === streamId ? { ...m, type:"doc", content: accumulated } : m
      ));
    } catch (err) {
      // Fallback
      const fallback = getFallback(docId);
      setMessages(prev => prev.map(m =>
        m.streamId === streamId ? { ...m, type:"doc", content: fallback } : m
      ));
    }

    setBusy(false);
  }

  function generateFromForm() {
    const prompt = buildPrompt(activeDoc, fields[activeDoc]);
    sendMessage(prompt);
  }

  function getFallback(docId) {
    const fallbacks = {
      coc: `=== CERTIFICATE OF COMPLIANCE ===
Doc #: COC-2026-0143 | Date: January 14, 2026

=== PART INFORMATION ===
Part Number: 8841-JKL Rev C | Lot: A44-222 | Qty: 500 PCS
Customer: Ford Motor Company | PO: PO-2026-00441

=== COMPLIANCE DECLARATION ===
Acme Manufacturing LLC certifies that the above-described product was manufactured
in full conformance with all applicable drawings, specifications, and customer quality
requirements. Final inspection was performed per our IATF 16949 certified QMS.

Standards: ISO 9001:2015, IATF 16949:2016, Customer Drawing 8841-JKL Rev C
Special Process: Zinc Plating per ASTM B633, Type II — Cert on file
Authorized Deviations: None

=== QUALITY VERIFICATION — ISO 9001:2015 CL. 8.6 ===
✓ PASS — Dimensional inspection: 100% per approved inspection plan
✓ PASS — Plating cert verified: 0.00052" avg (minimum 0.0005" per ASTM B633)
✓ PASS — Material certification: AISI 4140, Heat HT-44912-B on file

=== AUTHORIZATION ===
James Martinez, Quality Manager
Acme Manufacturing LLC | CAGE: 3KXB4
ISO 9001:2015 Cert QM-44912 | IATF 16949 Cert IT-88201

=== AI REVIEW NOTES ===
✓ Document complies with ISO 9001:2015 Clause 8.6 requirements for product release.
✓ IATF 16949 Clause 8.6.1 — Conformance of products and processes: satisfied.
⚠ WARNING: Ensure plating thickness records are retained per Clause 7.5.3 (control of documented information).
Audit pitfall: Auditors commonly verify that the person authorizing the COC has documented authority in the QMS. Confirm James Martinez appears in the quality responsibility matrix.`,

      psw: `=== PART SUBMISSION WARRANT — AIAG PPAP 4th EDITION ===
PSW #: PSW-8841-L3 | Level: 3 | Date: January 14, 2026
Part: 8841-JKL Rev C | Customer: Ford Motor Company | Reason: Initial Submission

=== 18-ELEMENT VERIFICATION ===
✓ PASS El 1 — Design Records
✓ PASS El 2 — Engineering Change Documents
✓ PASS El 3 — Customer Engineering Approval
✓ PASS El 4 — Design FMEA (DFMEA)
✓ PASS El 5 — Process Flow Diagram
✓ PASS El 6 — Process FMEA (PFMEA)
✓ PASS El 7 — Control Plan
✓ PASS El 8 — MSA Studies (Gage R&R)
✓ PASS El 9 — Dimensional Results
✓ PASS El 10 — Material & Performance Results
✓ PASS El 11 — Initial Process Studies
✓ PASS El 12 — Qualified Lab Documentation
⚠ WARNING: El 13 — AAR INCOMPLETE: Required for exterior-classified parts
✓ PASS El 14 — Sample Production Parts
⚠ WARNING: El 15 — Master Sample: Pending customer sign-off at source
✓ PASS El 16 — Checking Aids
⚠ WARNING: El 17 — CSR: Ford PPAP Requirements v5 checklist not yet included
✗ FAIL El 18 — PSW: Cannot submit until Elements 13, 15, 17 are resolved

=== INITIAL PROCESS STUDY — ELEMENT 11 ===
⚠ WARNING: Feature D7 Cpk: 1.58 — BELOW 1.67 MINIMUM
Customer deviation request or process improvement required before submission.
✓ PASS Feature D12 Cpk: 1.82
✓ PASS Thread M12 Cpk: 2.11

=== AI REVIEW NOTES ===
3 BLOCKING ITEMS before PSW can be submitted to Ford.
Immediate actions: (1) Complete AAR for El 13, (2) Obtain Ford PPAP Requirements v5 checklist from your SQE, (3) Submit Cpk deviation letter for Feature D7 or improve process to ≥1.67.
Audit pitfall: Cpk 1.58 submission without documented customer approval is the #1 PPAP rejection cause. Do not submit without resolution.`,

      "8d": `=== 8D CORRECTIVE ACTION REPORT ===
8D #: 8D-NCR-0045 | Linked: NCR-0045 | Date: January 14, 2026

=== D1 — TEAM ===
J. Martinez (Lead QE), K. Lee (QC Inspector), T. Brown (Manufacturing Eng.), Supplier Rep (PrecisionPlate LLC)

=== D2 — PROBLEM DESCRIPTION ===
Zinc plating thickness 0.00031" measured vs 0.0005" minimum per ASTM B633, Type II, Class Fe/Zn 13.
Lot A44-219, 240 lbs affected. Discovered at incoming inspection January 9, 2026.
IS: Lot A44-219 from PrecisionPlate LLC. IS NOT: Any other lots or suppliers.

=== D3 — CONTAINMENT (IMMEDIATE ACTIONS) ===
✓ PASS Quarantine all Lot A44-219 — MRB hold tag applied (Complete Jan 9)
✓ PASS 100% plating thickness inspection of all in-process inventory (Complete Jan 9)
✓ PASS Customer notified — zero affected product shipped to Ford (Confirmed)

=== D4 — ROOT CAUSE (5-WHY ANALYSIS) ===
Why 1: Plating below spec → Bath zinc concentration was 18 g/L (required: 22-28 g/L)
Why 2: Bath concentration low → Replenishment was not performed on schedule
Why 3: Replenishment missed → SPC control chart was not reviewed for 6 days
Why 4: Chart not reviewed → Backup operator protocol absent during primary operator vacation
ROOT CAUSE: No documented backup monitoring protocol for critical bath parameters during personnel absence

=== D5-D6 — CORRECTIVE & PREVENTIVE ACTIONS ===
1. Certify backup operator for bath monitoring — Owner: K. Lee — Due: Jan 20
2. Install automated IoT bath concentration sensor with alarm — Owner: T. Brown — Due: Feb 1
3. Update Control Plan and Work Instruction for daily bath parameter log — Due: Jan 18
4. SCAR issued to PrecisionPlate LLC — 8D response required by Jan 25

=== D7 — SYSTEMIC PREVENTION ===
Update Supplier Quality Agreement to require automated monitoring for all critical process parameters.
Add bath concentration to supplier PFMEA as critical characteristic.

=== D8 — TEAM RECOGNITION ===
Containment completed within 4 hours of detection. Zero customer impact achieved.

=== AI REVIEW NOTES ===
D7 and D8 pending effectiveness verification (schedule follow-up for Feb 15).
Reference: IATF 16949 Cl. 10.2.3 — Problem solving | ISO 9001:2015 Cl. 10.2 — Corrective action.
Audit pitfall: Verify D6 implementation evidence is documented. Auditors require objective evidence of corrective action implementation, not just planned actions.`,
    };
    return fallbacks[docId] || fallbacks["coc"];
  }

  const QUICK_CHIPS = [
    { label:"COC for Ford →", msg:"Generate a Certificate of Compliance for part 8841-JKL Rev C, lot A44-222, 500 PCS shipped to Ford Motor Company. Standards: ISO 9001:2015, IATF 16949. Zinc plating per ASTM B633. No authorized deviations." },
    { label:"Level 3 PSW →", msg:"Create a Level 3 PPAP Part Submission Warrant for part 8841-JKL and validate all 18 AIAG PPAP elements. Elements complete so far: 1,2,3,4,5,6,7,8,9,10,11,12,14,16." },
    { label:"8D NCR-0045 →", msg:"Draft a complete 8D Corrective Action Report for NCR-0045: zinc plating 0.00031\" measured vs 0.0005\" minimum per ASTM B633, lot A44-219, 240 lbs." },
    { label:"COA with eval →", msg:"Generate a Certificate of Analysis for AISI 4140 steel heat HT-44912-B and evaluate all test results: UTS 102 ksi, YS 87 ksi, Elong 21%, Hardness 31 HRC, C 0.40%." },
    { label:"PPAP gap check →", msg:"What PPAP elements are still missing for part 8841-JKL Level 3 submission? Elements completed: 1,2,3,4,5,6,7,8,9,10,11,12,14,16." },
  ];

  const tabStyle = (id) => ({
    padding:"6px 13px", borderRadius:6, fontSize:13, cursor:"pointer", border:"none", fontFamily:"inherit", transition:".15s",
    color: activeTab===id ? C.skyLt : "rgba(255,255,255,.5)",
    background: activeTab===id ? "rgba(74,144,217,.18)" : "none",
  });

  return <div style={S.app}>
    <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

    {/* TOPBAR */}
    <div style={S.topbar}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={S.logoPill}>QMS PRO</div>
        <span style={{ fontSize:12, color:"rgba(255,255,255,.38)", fontFamily:"monospace" }}>AI Document Studio</span>
      </div>
      <div style={S.tabs}>
        {[["gen","AI Generator"],["lib","Document Library"],["set","Settings"]].map(([id,label])=>
          <button key={id} style={tabStyle(id)} onClick={()=>setActiveTab(id)}>{label}</button>
        )}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(127,119,221,.2)", border:"1px solid rgba(127,119,221,.35)", borderRadius:20, padding:"3px 10px", fontSize:11, color:"#AFA9EC" }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:"#7F77DD", display:"inline-block", animation:"pulse 1.8s infinite" }} />
        Claude Sonnet · Live
      </div>
    </div>

    <div style={S.body}>
      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:".08em", color:"rgba(255,255,255,.28)", padding:"12px 14px 4px", fontWeight:500 }}>Document type</div>
        {DOCS.map(doc => (
          <button key={doc.id} onClick={()=>setActiveDoc(doc.id)}
            style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"8px 12px", border:"none", background: activeDoc===doc.id ? "rgba(74,144,217,.14)" : "none", color: activeDoc===doc.id ? C.skyLt : "rgba(255,255,255,.6)", fontSize:12, fontFamily:"inherit", cursor:"pointer", textAlign:"left", borderLeft: activeDoc===doc.id ? `3px solid ${C.sky}` : "3px solid transparent" }}>
            <div style={{ width:26, height:26, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0, fontFamily:"monospace", background:doc.bg, color:doc.color }}>{doc.label}</div>
            {doc.name}
          </button>
        ))}

        <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:".08em", color:"rgba(255,255,255,.28)", padding:"12px 14px 4px", fontWeight:500, marginTop:4 }}>Recent</div>
        {[
          { l:"COC",  n:"COC-2026-0142", s:"8841-JKL · Jan 10",  st:"Final",       sc:C.mint,   sb:"rgba(0,196,160,.12)" },
          { l:"COA",  n:"COA-2026-0089", s:"Lot A44-221 · Jan 9", st:"Final",      sc:C.mint,   sb:"rgba(0,196,160,.12)" },
          { l:"PSW",  n:"PSW-4420-BBR",  s:"Level 2 · Jan 8",     st:"Approved",   sc:C.mint,   sb:"rgba(127,119,221,.12)" },
          { l:"FAIR", n:"FAIR-9912-AAX", s:"AS9102 · Jan 7",      st:"Draft",      sc:C.skyLt,  sb:"rgba(245,166,35,.12)" },
        ].map((item,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 12px", borderBottom:"1px solid rgba(74,144,217,.07)", cursor:"pointer" }}>
            <div style={{ width:22, height:22, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, fontFamily:"monospace", background:item.sb, color:item.sc }}>{item.l}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:500 }}>{item.n}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.35)", marginTop:1 }}>{item.s}</div>
            </div>
            <span style={{ fontSize:10, padding:"2px 6px", borderRadius:10, fontWeight:500, background:"rgba(0,196,160,.14)", color:item.sc, border:`1px solid rgba(0,196,160,.25)` }}>{item.st}</span>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={S.main}>

        {/* AI GENERATOR TAB */}
        {activeTab === "gen" && (
          <div style={{ display:"flex", flex:1, overflow:"hidden", minHeight:0 }}>
            {/* FORM */}
            <div style={S.formSide}>
              <FormPanel docId={activeDoc} fields={fields[activeDoc]} setField={setField} />
              <Btn onClick={generateFromForm} style={{ width:"100%", justifyContent:"center", marginTop:4 }}>✦ Generate with AI</Btn>
              <Btn variant="ghost" onClick={()=>document.getElementById("chat-input")?.focus()} style={{ width:"100%", justifyContent:"center", fontSize:12 }}>💬 Chat about this document</Btn>
            </div>

            {/* CHAT */}
            <div style={S.chatSide}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderBottom:`1px solid rgba(74,144,217,.12)`, background:C.navyMid, flexShrink:0 }}>
                <span style={{ fontSize:12, fontWeight:500, color:C.skyLt }}>AI Document Assistant</span>
                <span style={{ flex:1 }} />
                <span style={{ fontSize:11, color:"rgba(255,255,255,.3)" }}>Generate, refine, review — in natural language</span>
              </div>

              <div ref={msgsRef} style={S.chatMsgs}>
                {messages.map((msg, i) => {
                  if (msg.type === "welcome") return (
                    <ChatMsg key={i} role="ai">
                      <p>Hello! I'm your QMS compliance document AI, powered by Claude. I generate professional COC, COA, COO, PSW, FAIR, 8D, PFMEA, SCAR, and more — from the form on the left or from natural language here.</p>
                      <p>Try a quick action or describe what you need:</p>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
                        {QUICK_CHIPS.map((c,j)=>(
                          <button key={j} onClick={()=>sendMessage(c.msg)}
                            style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(74,144,217,.1)", border:`1px solid rgba(74,144,217,.28)`, borderRadius:20, padding:"4px 10px", fontSize:11, color:C.skyLt, cursor:"pointer", fontFamily:"inherit" }}>
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </ChatMsg>
                  );
                  if (msg.role === "user") return (
                    <ChatMsg key={i} role="user"><p>{msg.content}</p></ChatMsg>
                  );
                  if (msg.type === "streaming" || msg.type === "doc") return (
                    <ChatMsg key={i} role="ai">
                      {msg.content
                        ? <DocOutput docId={msg.docId || activeDoc} content={msg.content} isStreaming={msg.type==="streaming"} />
                        : <div style={{ display:"flex", gap:4, alignItems:"center", padding:"4px 0" }}>
                            {[0,.2,.4].map((d,k)=><span key={k} style={{ width:5,height:5,borderRadius:"50%",background:C.sky,opacity:.35,animation:`blink 1.2s ${d}s infinite` }} />)}
                          </div>
                      }
                      {msg.type === "doc" && msg.content && (
                        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginTop:8 }}>
                          <Btn variant="ghost" onClick={()=>sendMessage("Make this more formal and add more specific clause references")} style={{ fontSize:11, padding:"4px 9px" }}>More formal</Btn>
                          <Btn variant="ghost" onClick={()=>sendMessage("Add a risk assessment section to this document")} style={{ fontSize:11, padding:"4px 9px" }}>Add risk section</Btn>
                          <Btn variant="ghost" onClick={()=>sendMessage("What audit pitfalls should I watch for with this document type?")} style={{ fontSize:11, padding:"4px 9px" }}>Audit pitfalls ↗</Btn>
                          <Btn variant="green" style={{ fontSize:11, padding:"4px 9px" }}>Email to Customer</Btn>
                        </div>
                      )}
                    </ChatMsg>
                  );
                  return null;
                })}
                {busy && messages[messages.length-1]?.role !== "ai" && (
                  <ChatMsg role="ai">
                    <div style={{ display:"flex", gap:4, alignItems:"center", padding:"4px 0" }}>
                      {[0,.2,.4].map((d,k)=><span key={k} style={{ width:5,height:5,borderRadius:"50%",background:C.sky,opacity:.35,animation:`blink 1.2s ${d}s infinite` }} />)}
                    </div>
                  </ChatMsg>
                )}
              </div>

              <div style={S.chatBar}>
                <input id="chat-input" value={inputVal} onChange={e=>setInputVal(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();} }}
                  placeholder="Ask AI to generate, edit, or review any compliance document..."
                  style={{ flex:1, background:"rgba(11,31,58,.8)", border:`1px solid rgba(74,144,217,.28)`, borderRadius:7, color:"#fff", fontFamily:"inherit", fontSize:12, padding:"8px 12px", outline:"none" }} />
                <Btn onClick={()=>sendMessage()} style={{ opacity: busy ? .5 : 1 }}>Send</Btn>
              </div>
            </div>
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === "lib" && (
          <div style={{ padding:20, overflowY:"auto", flex:1 }}>
            <div style={{ fontSize:15, fontWeight:500, marginBottom:14 }}>Document Library</div>
            <div style={S.card}>
              <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:".06em", color:C.skyLt, marginBottom:12, fontWeight:500 }}>January 2026 — generated documents</div>
              {[
                { type:"COC", num:"COC-2026-0142", desc:"P/N 8841-JKL Rev C — Ford Motor Co.", sub:"Lot A44-222 · 500 PCS · Jan 10, 2026", status:"Final", sc:C.mint, sb:"rgba(0,196,160,.14)" },
                { type:"COA", num:"COA-2026-0089", desc:"AISI 4140, Heat HT-44912-B", sub:"AcmeSteel Corp. · Jan 9, 2026", status:"Final", sc:C.skyLt, sb:"rgba(74,144,217,.14)" },
                { type:"PSW", num:"PSW-4420-BBR", desc:"P/N 4420-BBR Level 2 — Magna", sub:"All Level 2 elements · Jan 8, 2026", status:"Approved", sc:C.mint, sb:"rgba(127,119,221,.14)" },
                { type:"FAIR", num:"FAIR-9912-AAX", desc:"P/N 9912-AAX — AS9102 Form 1/2/3", sub:"Jan 7, 2026", status:"Draft", sc:C.skyLt, sb:"rgba(245,166,35,.14)" },
                { type:"8D", num:"8D-NCR-0046", desc:"Supplier Rev Level Failure — AcmeSteel", sub:"D1-D5 complete · Jan 6, 2026", status:"In Progress", sc:C.amber, sb:"rgba(74,144,217,.14)" },
              ].map((item,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom: i<4 ? "1px solid rgba(74,144,217,.09)" : "none" }}>
                  <div style={{ width:26, height:26, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, fontFamily:"monospace", background:item.sb, color:item.sc, flexShrink:0 }}>{item.type}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:500 }}>{item.num} — {item.desc}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,.35)", marginTop:1 }}>{item.sub}</div>
                  </div>
                  <span style={{ fontSize:10, padding:"2px 7px", borderRadius:10, fontWeight:500, background:`${item.sb}`, color:item.sc, border:`1px solid ${item.sc}44` }}>{item.status}</span>
                  <Btn variant="ghost" style={{ fontSize:11, padding:"3px 8px" }}>PDF</Btn>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "set" && (
          <div style={{ padding:20, overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ fontSize:15, fontWeight:500 }}>AI Engine Settings</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={S.card}>
                <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:".06em", color:C.skyLt, marginBottom:12, fontWeight:500 }}>Model configuration</div>
                <div style={{ marginBottom:10 }}>{fl("AI Model")}<FiSel value="claude-sonnet-4-20250514" onChange={()=>{}} options={["claude-sonnet-4-20250514","claude-opus-4-20250514"]} /></div>
                <div style={{ marginBottom:10 }}>{fl("Detail level")}<FiSel value="Detailed with clause references" onChange={()=>{}} options={["Concise","Detailed with clause references","Minimal"]} /></div>
                <div>{fl("Auto-cite standards clauses")}<FiSel value="Yes" onChange={()=>{}} options={["Yes","No"]} /></div>
              </div>
              <div style={S.card}>
                <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:".06em", color:C.skyLt, marginBottom:12, fontWeight:500 }}>Company profile (pre-fills all docs)</div>
                <div style={{ marginBottom:9 }}>{fl("Company name")}<Fi value="Acme Manufacturing LLC" onChange={()=>{}} /></div>
                <div style={{ marginBottom:9 }}>{fl("CAGE / DUNS")}<Fi value="3KXB4 / 12-345-6789" onChange={()=>{}} /></div>
                <div style={{ marginBottom:9 }}>{fl("QMS certification #")}<Fi value="ISO 9001:2015 Cert QM-44912" onChange={()=>{}} /></div>
                <div>{fl("Authorizing signature")}<Fi value="James Martinez, Quality Manager" onChange={()=>{}} /></div>
              </div>
            </div>
            <div style={S.card}>
              <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:".06em", color:C.skyLt, marginBottom:12, fontWeight:500 }}>Active standards — AI knowledge context</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4 }}>
                {["ISO 9001:2015","IATF 16949:2016","AS9145 (APQP/PPAP)","AS9100D","AIAG PPAP 4th Ed.","ISO 9001:2026 Draft","AIAG/VDA FMEA","ASTM / AMS Specs","NADCAP"].map((std,i)=>(
                  <label key={i} style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 0", borderBottom:"1px solid rgba(74,144,217,.07)", fontSize:12, cursor:"pointer" }}>
                    <input type="checkbox" defaultChecked={i<5} style={{ accentColor:C.sky }} />
                    {std}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>;
}
