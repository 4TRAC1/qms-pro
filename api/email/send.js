// api/email/send.js — sends compliance documents via Resend
export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const { to, subject, docType, docNumber, content, companyName, senderName } = await req.json()

  const apiKey   = process.env.RESEND_API_KEY
  const fromAddr = process.env.RESEND_FROM_EMAIL || 'compliance@qmspro.app'

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Email not configured — add RESEND_API_KEY to Vercel env vars' }), { status: 500 })
  }

  const DOC_LABELS = {
    coc: 'Certificate of Compliance', coa: 'Certificate of Analysis',
    coo: 'Certificate of Origin', psw: 'Part Submission Warrant',
    fair: 'First Article Inspection', mtr: 'Material Test Report',
    '8d': '8D Corrective Action Report', pfmea: 'Process FMEA',
    scar: 'Supplier Corrective Action Request', dev: 'Deviation / Waiver',
    imds: 'IMDS / REACH Report', qmp: 'Quality Management Plan',
  }

  const docLabel = DOC_LABELS[docType] || 'Compliance Document'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
    .wrap { max-width: 640px; margin: 0 auto; }
    .header { background: #0B1F3A; padding: 24px 32px; }
    .logo { background: #4A90D9; display: inline-block; padding: 4px 14px; border-radius: 5px; color: #fff; font-family: monospace; font-weight: 700; font-size: 13px; letter-spacing: .05em; }
    .body { background: #fff; padding: 32px; }
    .doc-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4A90D9; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
    .doc-title { font-size: 15px; font-weight: 600; color: #0B1F3A; margin-bottom: 4px; }
    .doc-num { font-size: 12px; color: #64748b; font-family: monospace; }
    .content-pre { background: #f1f5f9; border-radius: 6px; padding: 16px; font-family: monospace; font-size: 12px; line-height: 1.7; color: #334155; white-space: pre-wrap; word-break: break-word; max-height: 400px; overflow-y: auto; }
    .footer { background: #0B1F3A; padding: 16px 32px; color: #64748b; font-size: 11px; }
    .btn { display: inline-block; background: #4A90D9; color: #fff; padding: 10px 22px; border-radius: 7px; text-decoration: none; font-weight: 600; font-size: 13px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <span class="logo">QMS PRO</span>
      <span style="color: rgba(255,255,255,.5); font-size: 12px; margin-left: 10px; font-family: monospace;">AI Compliance Platform</span>
    </div>
    <div class="body">
      <p style="color:#334155; font-size:14px; line-height:1.6; margin-top:0;">Hello,</p>
      <p style="color:#334155; font-size:14px; line-height:1.6;">
        <strong>${companyName || 'Your supplier'}</strong> has sent you a compliance document via QMS Pro.
      </p>
      <div class="doc-box">
        <div class="doc-title">${docLabel}</div>
        <div class="doc-num">${docNumber || 'DRAFT'}</div>
      </div>
      <div class="content-pre">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      <p style="color:#64748b; font-size:12px; margin-top:20px; line-height:1.6;">
        This document was generated and sent by <strong>${senderName || companyName}</strong> using QMS Pro. 
        Please retain this document for your quality records.
      </p>
    </div>
    <div class="footer">
      <p style="margin:0;">Sent via QMS Pro · AI Compliance Platform · <a href="https://qmspro.app" style="color:#4A90D9;">qmspro.app</a></p>
      <p style="margin:4px 0 0;">This is an automated compliance document delivery. Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${companyName || 'QMS Pro'} <${fromAddr}>`,
      to: Array.isArray(to) ? to : [to],
      subject: subject || `${docLabel} — ${docNumber || 'DRAFT'} — ${companyName}`,
      html,
    }),
  })

  const result = await res.json()
  if (!res.ok) {
    return new Response(JSON.stringify({ error: result.message || 'Email send failed' }), { status: res.status })
  }

  return new Response(JSON.stringify({ success: true, id: result.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
