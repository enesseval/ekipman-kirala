import { formatCurrency, formatDate } from './format';
import type { QuoteLineItem } from '@/lib/types';

const PRINT_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #1a1a1a;
    font-size: 13px;
    line-height: 1.6;
    background: #fff;
  }
  .page {
    max-width: 820px;
    margin: 0 auto;
    padding: 48px 56px;
  }
  /* ── Header ── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 20px;
    margin-bottom: 28px;
  }
  .header h1 { font-size: 28px; font-weight: bold; letter-spacing: -0.5px; margin-bottom: 4px; }
  .header .sub { font-size: 11px; color: #666; }
  .header .meta { text-align: right; font-size: 12px; line-height: 1.7; font-family: Arial, sans-serif; }
  /* ── Label ── */
  .label {
    font-size: 9px;
    font-weight: bold;
    letter-spacing: 2px;
    color: #888;
    text-transform: uppercase;
    margin-bottom: 8px;
    font-family: Arial, sans-serif;
  }
  /* ── Client block ── */
  .client-block {
    margin-bottom: 28px;
    padding: 16px 20px;
    background: #f5f5f5;
    border-left: 3px solid #1a1a1a;
  }
  .client-block .name { font-size: 18px; font-weight: bold; margin: 4px 0; }
  .client-block .detail { font-size: 12px; color: #444; margin: 2px 0; }
  /* ── Body text ── */
  .body-text { margin-bottom: 28px; line-height: 1.75; }
  .body-text p { margin-bottom: 12px; color: #2a2a2a; }
  /* ── Table ── */
  .table-section { margin-bottom: 28px; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    font-family: Arial, sans-serif;
    margin-bottom: 16px;
  }
  thead tr { background: #1a1a1a; color: white; }
  thead th { padding: 9px 12px; text-align: left; font-size: 10px; letter-spacing: 0.5px; }
  thead th:last-child, thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
  tbody td { padding: 9px 12px; border-bottom: 1px solid #e5e5e5; }
  tbody td:last-child, tbody td:nth-child(3), tbody td:nth-child(4) { text-align: right; font-family: 'Courier New', monospace; }
  tbody tr:nth-child(even) td { background: #f9f9f9; }
  /* ── Totals ── */
  .totals { margin-left: auto; width: 300px; font-family: Arial, sans-serif; }
  .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; border-bottom: 1px solid #eee; }
  .grand-total {
    font-weight: bold;
    font-size: 15px;
    border-top: 2px solid #1a1a1a !important;
    border-bottom: 2px solid #1a1a1a !important;
    padding: 10px 0;
    margin-top: 4px;
  }
  /* ── Signatures ── */
  .signatures { display: flex; gap: 48px; margin-top: 48px; margin-bottom: 32px; }
  .sig-box { flex: 1; }
  .sig-line { border-bottom: 1px solid #1a1a1a; margin-top: 40px; margin-bottom: 6px; }
  .sig-box p { font-size: 11px; margin-top: 4px; font-family: Arial, sans-serif; }
  /* ── Footer ── */
  .footer {
    padding-top: 16px;
    border-top: 1px solid #ddd;
    font-size: 10px;
    color: #888;
    font-family: Arial, sans-serif;
    text-align: center;
  }
  .footer p { margin: 2px 0; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

export interface PrintQuoteData {
  quoteNumber: string;
  createdAt?: string;
  validUntil: string;
  clientName: string;
  eventName?: string;
  clientEmail?: string;
  clientPhone?: string;
  proposalText: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent?: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(data: PrintQuoteData): string {
  const today = data.createdAt || new Date().toISOString().split('T')[0];
  const taxPct = Math.round((data.taxRate ?? 0.2) * 100);

  const rows = data.lineItems.map((item) => `
    <tr>
      <td>${escapeHtml(item.equipmentName)}</td>
      <td>${item.equipmentType === 'espresso_machine' ? 'Espresso Makinesi' : 'Kahve Öğütücü'}</td>
      <td>${item.days}</td>
      <td>${escapeHtml(formatCurrency(item.dailyRate))}/gün</td>
      <td><strong>${escapeHtml(formatCurrency(item.subtotal))}</strong></td>
    </tr>
  `).join('');

  const discountRow = data.discountAmount > 0
    ? `<div class="total-row"><span>İndirim${data.discountPercent ? ` (%${data.discountPercent})` : ''}</span><span>−${escapeHtml(formatCurrency(data.discountAmount))}</span></div>`
    : '';

  const bodyLines = data.proposalText
    .split('\n')
    .filter(Boolean)
    .map((l) => `<p>${escapeHtml(l)}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <title>Teklif — ${escapeHtml(data.quoteNumber)}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div>
      <h1>BrewOps</h1>
      <p class="sub">Premium Ekipman Kiralama · Teknik Destek · Barista Hizmetleri</p>
    </div>
    <div class="meta">
      <p><strong>${escapeHtml(data.quoteNumber)}</strong></p>
      <p>Tarih: ${escapeHtml(formatDate(today))}</p>
      <p>Geçerlilik: ${escapeHtml(formatDate(data.validUntil))}</p>
    </div>
  </div>

  <div class="client-block">
    <p class="label">Sayın</p>
    <p class="name">${escapeHtml(data.clientName || '—')}</p>
    ${data.eventName && data.clientName ? `<p class="detail">${escapeHtml(data.eventName)}</p>` : ''}
    ${data.clientEmail ? `<p class="detail">${escapeHtml(data.clientEmail)}</p>` : ''}
    ${data.clientPhone ? `<p class="detail">${escapeHtml(data.clientPhone)}</p>` : ''}
  </div>

  ${bodyLines ? `<div class="body-text">${bodyLines}</div>` : ''}

  <div class="table-section">
    <p class="label">Ekipman ve Fiyat Listesi</p>
    <table>
      <thead>
        <tr>
          <th>Ekipman</th>
          <th>Tür</th>
          <th>Gün</th>
          <th>Birim Fiyat</th>
          <th>Toplam</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals">
      <div class="total-row"><span>Ara Toplam</span><span>${escapeHtml(formatCurrency(data.subtotal))}</span></div>
      ${discountRow}
      <div class="total-row"><span>KDV (%${taxPct})</span><span>${escapeHtml(formatCurrency(data.taxAmount))}</span></div>
      <div class="total-row grand-total"><span>Genel Toplam</span><span>${escapeHtml(formatCurrency(data.total))}</span></div>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-box">
      <p class="label">Müşteri İmzası</p>
      <div class="sig-line"></div>
      <p>${escapeHtml(data.clientName || '—')}</p>
    </div>
    <div class="sig-box">
      <p class="label">BrewOps Yetkili</p>
      <div class="sig-line"></div>
      <p>BrewOps Ekipman Kiralama</p>
    </div>
  </div>

  <div class="footer">
    <p>BrewOps Ekipman Kiralama — Bu teklif ${escapeHtml(formatDate(data.validUntil))} tarihine kadar geçerlidir.</p>
    <p>info@brewops.com · +90 (212) 555 01 01 · www.brewops.com</p>
  </div>

</div>
</body>
</html>`;
}

export function printQuote(data: PrintQuoteData): void {
  const html = buildHtml(data);
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Popup engelleyici aktif. Lütfen popup izni verin ve tekrar deneyin.');
    return;
  }
  win.document.write(html);
  win.document.close();
  // Small delay so the browser renders fonts/images before print dialog
  win.addEventListener('load', () => {
    win.focus();
    win.print();
    win.close();
  });
  // Fallback if load already fired
  setTimeout(() => {
    try { win.focus(); win.print(); win.close(); } catch { /* already closed */ }
  }, 800);
}
