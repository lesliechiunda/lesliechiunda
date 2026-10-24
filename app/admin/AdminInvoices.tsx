"use client";

import { useState } from "react";
import type { InvoiceRecord } from "../../lib/repository";
import { formatRand, getInvoiceLines, type InvoiceLine } from "../../lib/invoice";

type Draft = { clientName: string; clientEmail: string; clientAddress: string; issueDate: string; dueDate: string; status: string; taxPercent: number; notes: string; lineItems: InvoiceLine[] };
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });
const blank = (): Draft => ({ clientName: "", clientEmail: "", clientAddress: "", issueDate: today(), dueDate: today(), status: "draft", taxPercent: 0, notes: "", lineItems: [{ description: "", quantity: 1, unitPriceCents: 0 }] });
const fromInvoice = (invoice: InvoiceRecord): Draft => ({ clientName: invoice.clientName, clientEmail: invoice.clientEmail, clientAddress: invoice.clientAddress, issueDate: invoice.issueDate, dueDate: invoice.dueDate, status: invoice.status, taxPercent: invoice.taxPercent, notes: invoice.notes, lineItems: getInvoiceLines(invoice) });

export default function AdminInvoices({ initialInvoices }: { initialInvoices: InvoiceRecord[] }) {
  const [records, setRecords] = useState(initialInvoices);
  const [selectedId, setSelectedId] = useState(initialInvoices[0]?.id ?? "");
  const [draft, setDraft] = useState<Draft>(initialInvoices[0] ? fromInvoice(initialInvoices[0]) : blank());
  const [creating, setCreating] = useState(!initialInvoices.length);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selected = records.find((invoice) => invoice.id === selectedId);
  const subtotal = draft.lineItems.reduce((total, line) => total + line.quantity * line.unitPriceCents, 0);
  const tax = Math.round(subtotal * draft.taxPercent / 100);

  function choose(invoice: InvoiceRecord) { setSelectedId(invoice.id); setDraft(fromInvoice(invoice)); setCreating(false); setMessage(""); }
  function setField<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((current) => ({ ...current, [key]: value })); }
  function setLine(index: number, key: keyof InvoiceLine, value: string | number) {
    setDraft((current) => ({ ...current, lineItems: current.lineItems.map((line, position) => position === index ? { ...line, [key]: value } : line) }));
  }
  function startNew() { setDraft(blank()); setSelectedId(""); setCreating(true); setMessage(""); }

  async function save() {
    setBusy(true); setMessage("");
    try {
      const url = creating ? "/api/admin/invoices" : `/api/admin/invoices/${selectedId}`;
      const response = await fetch(url, { method: creating ? "POST" : "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
      const payload = await response.json() as { invoice?: InvoiceRecord; error?: string };
      if (!response.ok || !payload.invoice) throw new Error(payload.error ?? "Could not save invoice.");
      const saved = payload.invoice;
      setRecords((items) => [saved, ...items.filter((item) => item.id !== saved.id)]);
      setSelectedId(saved.id); setDraft(fromInvoice(saved)); setCreating(false);
      setMessage(`${saved.number} saved. You can download its PDF.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save invoice."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!selected || !window.confirm(`Permanently delete invoice ${selected.number}?`)) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/invoices/${selected.id}`, { method: "DELETE" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not delete invoice.");
      const remaining = records.filter((invoice) => invoice.id !== selected.id);
      setRecords(remaining); setSelectedId(remaining[0]?.id ?? ""); setDraft(remaining[0] ? fromInvoice(remaining[0]) : blank()); setCreating(!remaining.length);
      setMessage("Invoice deleted.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete invoice."); }
    finally { setBusy(false); }
  }

  return <section className="simple-section" id="invoices">
    <div className="simple-heading"><div><p className="admin-kicker">Private records</p><h2>Invoices</h2><p>Create and keep invoices here, then download a PDF whenever you need it.</p></div><button type="button" className="admin-primary" onClick={startNew}>+ New invoice</button></div>
    {message ? <p className="admin-message" role="status">{message}</p> : null}
    <div className="simple-grid">
      <div className="invoice-list">{records.map((invoice) => <button type="button" key={invoice.id} className={selected?.id === invoice.id && !creating ? "is-selected" : ""} onClick={() => choose(invoice)}><span><strong>{invoice.number}</strong><small>{invoice.clientName} · {invoice.issueDate}</small></span><span><b>{formatRand(invoice.totalCents)}</b><small>{invoice.status}</small></span></button>)}{!records.length ? <p className="simple-empty">No invoices yet. Create your first one using the form.</p> : null}</div>
      <div className="record-panel invoice-editor">
        <div className="record-panel-head"><div><p className="admin-kicker">{creating ? "New record" : "Invoice editor"}</p><h3>{creating ? "New invoice" : selected?.number}</h3></div>{selected && !creating ? <span>{selected.status.toUpperCase()}</span> : null}</div>
        <div className="listing-form">
          <label className="form-field">Client name<input required value={draft.clientName} onChange={(event) => setField("clientName", event.target.value)} /></label>
          <div className="form-pair"><label className="form-field">Client email<input type="email" value={draft.clientEmail} onChange={(event) => setField("clientEmail", event.target.value)} /></label><label className="form-field">Status<select value={draft.status} onChange={(event) => setField("status", event.target.value)}><option value="draft">Draft</option><option value="issued">Issued</option><option value="paid">Paid</option><option value="void">Void</option></select></label></div>
          <label className="form-field">Client address<textarea rows={2} value={draft.clientAddress} onChange={(event) => setField("clientAddress", event.target.value)} /></label>
          <div className="form-pair"><label className="form-field">Issue date<input type="date" value={draft.issueDate} onChange={(event) => setField("issueDate", event.target.value)} /></label><label className="form-field">Due date<input type="date" value={draft.dueDate} onChange={(event) => setField("dueDate", event.target.value)} /></label></div>
          <div className="invoice-lines"><div className="invoice-lines-title"><strong>Items</strong><button type="button" className="archive-button" onClick={() => setField("lineItems", [...draft.lineItems, { description: "", quantity: 1, unitPriceCents: 0 }])}>+ Add item</button></div>{draft.lineItems.map((line, index) => <div className="invoice-line" key={index}><label className="form-field">Description<input value={line.description} onChange={(event) => setLine(index, "description", event.target.value)} /></label><label className="form-field">Qty<input type="number" min="1" step="1" value={line.quantity} onChange={(event) => setLine(index, "quantity", Number(event.target.value))} /></label><label className="form-field">Price (R)<input type="number" min="0" step="0.01" value={line.unitPriceCents / 100} onChange={(event) => setLine(index, "unitPriceCents", Math.round(Number(event.target.value) * 100))} /></label><button type="button" aria-label={`Remove item ${index + 1}`} disabled={draft.lineItems.length === 1} onClick={() => setField("lineItems", draft.lineItems.filter((_, position) => position !== index))}>×</button></div>)}</div>
          <label className="form-field">Tax % (only if applicable)<input type="number" min="0" max="100" step="1" value={draft.taxPercent} onChange={(event) => setField("taxPercent", Number(event.target.value))} /></label>
          <div className="invoice-totals"><div><span>Subtotal</span><strong>{formatRand(subtotal)}</strong></div><div><span>Tax</span><strong>{formatRand(tax)}</strong></div><div className="invoice-total"><span>Total · ZAR</span><strong>{formatRand(subtotal + tax)}</strong></div></div>
          <label className="form-field">Notes (optional)<textarea rows={3} value={draft.notes} onChange={(event) => setField("notes", event.target.value)} /></label>
        </div>
        <div className="editor-actions">{selected?.status === "draft" && !creating ? <button type="button" className="danger-button" disabled={busy} onClick={remove}>Delete draft</button> : <span />}{selected && !creating ? <a className="archive-button" href={`/api/admin/invoices/${selected.id}/pdf`} download={`${selected.number}.pdf`}>Download PDF ↓</a> : null}<button type="button" className="admin-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : creating ? "Create invoice" : "Save changes"}</button></div>
      </div>
    </div>
  </section>;
}
