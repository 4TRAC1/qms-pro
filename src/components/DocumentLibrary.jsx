// src/components/DocumentLibrary.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { exportDocumentPDF } from '../lib/pdfExport'
import { format } from 'date-fns'

const C = { navy:'#0B1F3A', navyMid:'#152D50', sky:'#4A90D9', skyLt:'#7FBCF0', mint:'#00C4A0', mintD:'#00957A', amber:'#F5A623', coral:'#E86252', border:'rgba(74,144,217,.18)' }

const TYPE_COLORS = {
  coc:{bg:'rgba(0,196,160,.14)',c:'#00C4A0'}, coa:{bg:'rgba(74,144,217,.14)',c:'#7FBCF0'},
  coo:{bg:'rgba(212,175,55,.14)',c:'#D4AF37'}, psw:{bg:'rgba(127,119,221,.14)',c:'#AFA9EC'},
  fair:{bg:'rgba(245,166,35,.14)',c:'#F5A623'}, mtr:{bg:'rgba(232,98,82,.14)',c:'#E86252'},
  '8d':{bg:'rgba(74,144,217,.14)',c:'#7FBCF0'}, pfmea:{bg:'rgba(232,98,82,.14)',c:'#E86252'},
  scar:{bg:'rgba(245,166,35,.14)',c:'#F5A623'}, dev:{bg:'rgba(212,175,55,.14)',c:'#D4AF37'},
  imds:{bg:'rgba(0,196,160,.14)',c:'#00C4A0'}, qmp:{bg:'rgba(127,119,221,.14)',c:'#AFA9EC'},
}

const STATUS_STYLE = {
  draft:   {bg:'rgba(74,144,217,.14)',c:'#7FBCF0'},
  final:   {bg:'rgba(0,196,160,.14)',c:'#00C4A0'},
  approved:{bg:'rgba(0,196,160,.14)',c:'#00C4A0'},
  void:    {bg:'rgba(120,130,145,.14)',c:'rgba(255,255,255,.35)'},
}

export default function DocumentLibrary() {
  const { org } = useAuth()
  const navigate = useNavigate()
  const [docs, setDocs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [exporting, setExporting] = useState(null)

  useEffect(() => {
    if (!org?.id) return
    supabase.from('documents')
      .select('*')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setDocs(data || []); setLoading(false) })
  }, [org?.id])

  const filtered = docs.filter(d => {
    const matchType = typeFilter === 'all' || d.doc_type === typeFilter
    const matchSearch = !search || [d.doc_number, d.title, d.customer, d.part_number, d.lot_number]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchType && matchSearch
  })

  async function handleExportPDF(doc) {
    setExporting(doc.id)
    try {
      await exportDocumentPDF({ docType: doc.doc_type, docNumber: doc.doc_number, content: doc.content, company: org, fields: doc.fields || {} })
    } finally { setExporting(null) }
  }

  async function updateStatus(docId, status) {
    await supabase.from('documents').update({ status }).eq('id', docId)
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, status } : d))
  }

  if (loading) return <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:C.navy, color:'rgba(255,255,255,.4)', fontFamily:'monospace' }}>Loading library…</div>

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24, background:C.navy, color:'#fff', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div style={{ fontSize:18, fontWeight:600 }}>Document Library</div>
        <button onClick={() => navigate('/docs')} style={{ padding:'8px 16px', background:C.sky, border:'none', borderRadius:7, color:'#fff', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
          ✦ New Document
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by part #, customer, doc #…"
          style={{ flex:1, minWidth:200, background:'rgba(11,31,58,.75)', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'8px 11px', outline:'none' }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ background:'#152D50', border:`1px solid rgba(74,144,217,.3)`, borderRadius:7, color:'#fff', fontFamily:'inherit', fontSize:12, padding:'8px 11px', outline:'none' }}>
          <option value="all">All types</option>
          {['coc','coa','coo','psw','fair','mtr','8d','pfmea','scar','dev','imds','qmp'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'rgba(255,255,255,.3)' }}>
          <div style={{ fontSize:32, marginBottom:12 }}>📄</div>
          <div style={{ fontSize:14 }}>No documents yet</div>
          <div style={{ fontSize:12, marginTop:6 }}>Generate your first document in the AI Studio</div>
          <button onClick={() => navigate('/docs')} style={{ marginTop:16, padding:'8px 20px', background:C.sky, border:'none', borderRadius:7, color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Open AI Studio →</button>
        </div>
      ) : (
        <div style={{ background:C.navyMid, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
          {filtered.map((doc, i) => {
            const tc = TYPE_COLORS[doc.doc_type] || TYPE_COLORS.coc
            const sc = STATUS_STYLE[doc.status] || STATUS_STYLE.draft
            return (
              <div key={doc.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom: i < filtered.length-1 ? `1px solid rgba(74,144,217,.08)` : 'none' }}>
                <div style={{ width:30, height:30, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, fontFamily:'monospace', background:tc.bg, color:tc.c, flexShrink:0 }}>
                  {doc.doc_type?.toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {doc.doc_number} {doc.title ? `— ${doc.title}` : ''}
                  </div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:2 }}>
                    {[doc.customer, doc.part_number, doc.lot_number].filter(Boolean).join(' · ')}
                    {doc.created_at ? ` · ${format(new Date(doc.created_at), 'MMM d, yyyy')}` : ''}
                  </div>
                </div>
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, fontWeight:500, background:sc.bg, color:sc.c, border:`1px solid ${sc.c}44`, flexShrink:0 }}>
                  {doc.status}
                </span>
                <select value={doc.status} onChange={e => updateStatus(doc.id, e.target.value)}
                  style={{ background:'rgba(11,31,58,.6)', border:`1px solid rgba(74,144,217,.25)`, borderRadius:5, color:'rgba(255,255,255,.6)', fontSize:10, padding:'3px 6px', cursor:'pointer', fontFamily:'inherit' }}>
                  {['draft','final','approved','void'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => handleExportPDF(doc)} disabled={exporting === doc.id}
                  style={{ padding:'5px 10px', background:'rgba(0,196,160,.15)', border:`1px solid rgba(0,196,160,.3)`, borderRadius:6, color:C.mint, fontSize:10, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
                  {exporting === doc.id ? '…' : 'PDF'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
