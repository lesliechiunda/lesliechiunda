import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatRand, getInvoiceLines } from "./invoice";
import type { InvoiceRecord } from "./repository";

const pageWidth = 595.28;
const pageHeight = 841.89;
const dark = rgb(0.10, 0.12, 0.10);
const muted = rgb(0.40, 0.44, 0.40);
const light = rgb(0.89, 0.91, 0.86);
const accent = rgb(0.79, 0.95, 0.42);
const safe = (value: string) => value.normalize("NFKD").replace(/[\u2010-\u2015]/g, "-").replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[^\x20-\x7e\n]/g, "");

export async function createInvoicePdf(invoice: InvoiceRecord): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  document.setTitle(`Invoice ${invoice.number}`);
  document.setAuthor("Leslie Chiunda");
  document.setSubject(`Invoice for ${safe(invoice.clientName)}`);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const items = getInvoiceLines(invoice);
  let page = document.addPage([pageWidth, pageHeight]);
  let y = pageHeight - 52;

  const text = (value: string, x: number, top: number, size = 10, strong = false, colour = dark) => {
    page.drawText(safe(value), { x, y: top, size, font: strong ? bold : regular, color: colour });
  };
  const right = (value: string, x: number, top: number, size = 10, strong = false, colour = dark) => {
    const font = strong ? bold : regular;
    const label = safe(value);
    text(label, x - font.widthOfTextAtSize(label, size), top, size, strong, colour);
  };
  const rule = (top: number) => page.drawLine({ start: { x: 48, y: top }, end: { x: pageWidth - 48, y: top }, thickness: 0.7, color: light });
  const wrap = (value: string, maxWidth: number, size: number, strong = false) => {
    const font = strong ? bold : regular;
    const words = safe(value).split(/\s+/).filter(Boolean).flatMap((word) => {
      if (font.widthOfTextAtSize(word, size) <= maxWidth) return [word];
      const parts: string[] = [];
      let part = "";
      for (const character of word) {
        if (font.widthOfTextAtSize(part + character, size) > maxWidth && part) { parts.push(part); part = ""; }
        part += character;
      }
      if (part) parts.push(part);
      return parts;
    });
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) current = candidate;
      else { if (current) lines.push(current); current = word; }
    }
    if (current) lines.push(current);
    return lines;
  };
  const header = (continuation = false) => {
    page.drawRectangle({ x: 48, y: pageHeight - 71, width: 35, height: 35, color: dark });
    text("LC", 56, pageHeight - 60, 15, true, accent);
    text("LESLIE CHIUNDA", 95, pageHeight - 48, 13, true);
    text("DIGITAL STUDIO  /  JOHANNESBURG, SOUTH AFRICA", 95, pageHeight - 64, 8, false, muted);
    right(continuation ? "INVOICE  /  CONTINUED" : "INVOICE", pageWidth - 48, pageHeight - 48, 13, true);
    right(invoice.number, pageWidth - 48, pageHeight - 65, 9, false, muted);
    rule(pageHeight - 89);
  };
  header();
  y = pageHeight - 123;
  text("BILL TO", 48, y, 8, true, muted);
  const nameLines = wrap(invoice.clientName, 300, 17, true);
  nameLines.forEach((line, index) => text(line, 48, y - 22 - index * 20, 17, true));
  let clientY = y - 39 - (nameLines.length - 1) * 20;
  for (const line of [invoice.clientEmail, ...invoice.clientAddress.split("\n")].filter(Boolean)) {
    for (const wrapped of wrap(line, 280, 9)) { text(wrapped, 48, clientY, 9, false, muted); clientY -= 13; }
  }
  text("ISSUED", 395, y, 8, true, muted);
  text(invoice.issueDate, 395, y - 17, 10, true);
  text("DUE", 395, y - 45, 8, true, muted);
  text(invoice.dueDate, 395, y - 62, 10, true);
  text("STATUS", 395, y - 90, 8, true, muted);
  text(invoice.status.toUpperCase(), 395, y - 107, 10, true);
  y = Math.min(clientY - 28, y - 143);
  if (y < 190) {
    page = document.addPage([pageWidth, pageHeight]);
    header(true);
    y = pageHeight - 125;
  }
  const tableHeader = () => {
    page.drawRectangle({ x: 48, y: y - 8, width: pageWidth - 96, height: 31, color: dark });
    text("DESCRIPTION", 59, y + 3, 8, true, accent);
    right("QTY", 390, y + 3, 8, true, accent);
    right("UNIT PRICE", 470, y + 3, 8, true, accent);
    right("AMOUNT", pageWidth - 59, y + 3, 8, true, accent);
    y -= 28;
  };
  tableHeader();
  for (const item of items) {
    const description = wrap(item.description, 260, 9);
    const height = Math.max(39, description.length * 13 + 17);
    if (y - height < 140) {
      page = document.addPage([pageWidth, pageHeight]);
      header(true);
      y = pageHeight - 125;
      tableHeader();
    }
    description.forEach((line, index) => text(line, 59, y - 3 - index * 13, 9));
    right(String(item.quantity), 390, y - 3, 9);
    right(formatRand(item.unitPriceCents), 470, y - 3, 9);
    right(formatRand(item.quantity * item.unitPriceCents), pageWidth - 59, y - 3, 9, true);
    y -= height;
    rule(y + 8);
  }
  if (y < 210) {
    page = document.addPage([pageWidth, pageHeight]);
    header(true);
    y = pageHeight - 130;
  }
  y -= 22;
  text("Subtotal", 385, y, 10, false, muted);
  right(formatRand(invoice.subtotalCents), pageWidth - 59, y, 10);
  y -= 24;
  text(`Tax (${invoice.taxPercent}%)`, 385, y, 10, false, muted);
  right(formatRand(invoice.taxCents), pageWidth - 59, y, 10);
  y -= 36;
  page.drawRectangle({ x: 367, y: y - 15, width: 180, height: 43, color: accent });
  text("TOTAL ZAR", 380, y + 1, 10, true);
  right(formatRand(invoice.totalCents), pageWidth - 59, y + 1, 13, true);
  if (invoice.notes.trim()) {
    y -= 72;
    if (y < 125) { page = document.addPage([pageWidth, pageHeight]); header(true); y = pageHeight - 125; }
    text("NOTES", 48, y, 8, true, muted);
    y -= 18;
    for (const line of wrap(invoice.notes, pageWidth - 96, 9)) {
      if (y < 102) { page = document.addPage([pageWidth, pageHeight]); header(true); y = pageHeight - 125; }
      text(line, 48, y, 9); y -= 14;
    }
  }
  for (const sheet of document.getPages()) {
    sheet.drawLine({ start: { x: 48, y: 72 }, end: { x: pageWidth - 48, y: 72 }, thickness: 0.7, color: light });
    sheet.drawText("lesliechiunda@outlook.com  |  +27 79 403 1161", { x: 48, y: 54, size: 8, font: regular, color: muted });
    sheet.drawText(`${document.getPages().indexOf(sheet) + 1} / ${document.getPageCount()}`, { x: pageWidth - 68, y: 54, size: 8, font: regular, color: muted });
  }
  return document.save();
}
