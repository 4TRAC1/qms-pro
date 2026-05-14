// src/lib/pdfExport.js
// Generates professional PDF documents from QMS document content.

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'

const BRAND = {
  navy:   [11, 31, 58],
  sky:    [74, 144, 217],
  mint:   [0, 196, 160],
  amber:  [245, 166, 35],
  coral:  [232, 98, 82],
  white:  [255, 255, 255],
  gray:   [120, 130, 145],
  lgray:  [240, 243, 247],
  text:   [30, 40, 55],
}

const DOC_LABELS = {
  coc: 'Certificate of Compliance',
  coa: 'Certificate of Analysis',
  coo: 'Certificate of Origin',
  psw: 'Part Submission Warrant',
  fair: 'First Article Inspection Report',
  mtr: 'Material Test Report',
  '8d': '8D Corrective Action Report',
  pfmea: 'Process FMEA',
  scar: 'Supplier Corrective Action Request',
  dev: 'Deviation / Waiver Request',
  imds: 'IMDS / REACH Report',
  qmp: 'Quality Management Plan',
}

/**
 * exportDocumentPDF({ docType, docNumber, content, company, fields })
 * Downloads a PDF of the generated QMS document.
 */
export async function exportDocumentPDF({ docType, docNumber, content, company = {}, fields = {} }) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const W = pdf.internal.pageSize.getWidth()
  const H = pdf.internal.pageSize.getHeight()
  const margin = 18
  const contentWidth = W - margin * 2

  // ── Header bar ────────────────────────────────────────────────────────────
  pdf.setFillColor(...BRAND.navy)
  pdf.rect(0, 0, W, 28, 'F')

  // Logo pill
  pdf.setFillColor(...BRAND.sky)
  pdf.roundedRect(margin, 8, 22, 12, 2, 2, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(...BRAND.white)
  pdf.text('QMS PRO', margin + 11, 15.5, { align: 'center' })

  // Document title
  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.text(DOC_LABELS[docType] || 'QMS Document', margin + 28, 14)

  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...BRAND.lgray)
  pdf.text(`${docNumber || 'DRAFT'}  ·  ${format(new Date(), 'MMMM d, yyyy')}`, margin + 28, 20)

  // ── Company strip ─────────────────────────────────────────────────────────
  pdf.setFillColor(...BRAND.lgray)
  pdf.rect(0, 28, W, 14, 'F')
  pdf.setTextColor(...BRAND.text)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text(company.name || 'Your Company', margin, 36)
  pdf.setFont('helvetica', 'normal')
  const certLine = [company.iso_cert, company.iatf_cert].filter(Boolean).join('  ·  ')
  if (certLine) pdf.text(certLine, margin, 40)
  if (company.cage_code) {
    pdf.text(`CAGE: ${company.cage_code}`, W - margin, 36, { align: 'right' })
  }

  // ── Separator line ────────────────────────────────────────────────────────
  let y = 50
  pdf.setDrawColor(...BRAND.sky)
  pdf.setLineWidth(0.5)
  pdf.line(margin, y, W - margin, y)
  y += 6

  // ── Parse and render content ──────────────────────────────────────────────
  pdf.setTextColor(...BRAND.text)
  const lines = content.split('\n')

  for (const rawLine of lines) {
    if (y > H - 30) {
      pdf.addPage()
      y = 20
    }
    const line = rawLine.trim()
    if (!line) { y += 3; continue }

    // Section header  === SECTION ===
    if (line.startsWith('===') && line.endsWith('===')) {
      y += 2
      const header = line.replace(/^===\s*/, '').replace(/\s*===$/, '')
      pdf.setFillColor(...BRAND.navy)
      pdf.rect(margin, y - 4, contentWidth, 8, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(8.5)
      pdf.setTextColor(...BRAND.white)
      pdf.text(header.toUpperCase(), margin + 3, y + 0.5)
      pdf.setTextColor(...BRAND.text)
      y += 9
      continue
    }

    // Pass / Fail / Warning markers
    let lineColor = BRAND.text
    if (line.includes('✓ PASS')) lineColor = BRAND.mint
    else if (line.includes('✗ FAIL')) lineColor = BRAND.coral
    else if (line.includes('⚠')) lineColor = BRAND.amber

    // Clean unicode symbols for PDF rendering
    const cleanLine = line
      .replace(/✓ PASS/g, '[PASS]')
      .replace(/✗ FAIL/g, '[FAIL]')
      .replace(/⚠ WARNING:/g, '[WARNING]')
      .replace(/⚠/g, '[!]')

    pdf.setFont('helvetica', lineColor !== BRAND.text ? 'bold' : 'normal')
    pdf.setFontSize(8.5)
    pdf.setTextColor(...lineColor)

    const wrapped = pdf.splitTextToSize(cleanLine, contentWidth - 2)
    for (const wline of wrapped) {
      if (y > H - 30) { pdf.addPage(); y = 20 }
      pdf.text(wline, margin + 2, y)
      y += 5
    }
    pdf.setTextColor(...BRAND.text)
  }

  // ── Signature block ───────────────────────────────────────────────────────
  if (y > H - 55) { pdf.addPage(); y = 20 }
  y += 8
  pdf.setDrawColor(...BRAND.sky)
  pdf.setLineWidth(0.3)
  pdf.line(margin, y, W - margin, y)
  y += 8
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...BRAND.text)
  pdf.text('AUTHORIZED SIGNATORY', margin, y)
  pdf.text('DATE', W / 2, y)
  y += 12
  pdf.setDrawColor(...BRAND.gray)
  pdf.line(margin, y, margin + 80, y)
  pdf.line(W / 2, y, W / 2 + 50, y)
  y += 5
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7.5)
  pdf.setTextColor(...BRAND.gray)
  pdf.text(company.quality_manager || 'Quality Manager', margin, y)
  pdf.text(format(new Date(), 'MM/dd/yyyy'), W / 2, y)

  // ── Footer on all pages ───────────────────────────────────────────────────
  const pageCount = pdf.internal.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    pdf.setPage(p)
    pdf.setFillColor(...BRAND.navy)
    pdf.rect(0, H - 10, W, 10, 'F')
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...BRAND.lgray)
    pdf.text('CONTROLLED DOCUMENT — QMS Pro', margin, H - 4)
    pdf.text(`Page ${p} of ${pageCount}`, W - margin, H - 4, { align: 'right' })
    pdf.text(`Generated ${format(new Date(), 'yyyy-MM-dd HH:mm')} UTC`, W / 2, H - 4, { align: 'center' })
  }

  // ── Download ──────────────────────────────────────────────────────────────
  const filename = `${docNumber || docType.toUpperCase()}-${format(new Date(), 'yyyyMMdd')}.pdf`
  pdf.save(filename)
  return filename
}
