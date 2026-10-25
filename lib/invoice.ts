import type { InvoiceValues } from "./repository";

export type InvoiceLine = { description: string; quantity: number; unitPriceCents: number };

export function parseInvoiceInput(body: unknown): InvoiceValues {
  if (!body || typeof body !== "object") throw new Error("Enter invoice details.");
  const data = body as Record<string, unknown>;
  const string = (key: string, length: number) => typeof data[key] === "string" ? (data[key] as string).trim().slice(0, length) : "";
  const clientName = string("clientName", 160);
  const issueDate = string("issueDate", 10);
  const dueDate = string("dueDate", 10);
  if (!clientName) throw new Error("Client name is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate) || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(Date.parse(issueDate)) || Number.isNaN(Date.parse(dueDate))) throw new Error("Enter valid issue and due dates.");
  if (dueDate < issueDate) throw new Error("Due date must be on or after the issue date.");
  if (!Array.isArray(data.lineItems) || data.lineItems.length < 1 || data.lineItems.length > 40) throw new Error("Add between 1 and 40 invoice items.");
  const lines = data.lineItems.map((raw) => {
    const line = raw as Record<string, unknown>;
    const description = typeof line?.description === "string" ? line.description.trim().slice(0, 180) : "";
    const quantity = Number(line?.quantity);
    const unitPriceCents = Number(line?.unitPriceCents);
    if (!description || !Number.isInteger(quantity) || quantity < 1 || quantity > 10000 || !Number.isSafeInteger(unitPriceCents) || unitPriceCents < 0 || unitPriceCents > 100000000) throw new Error("Each item needs a description, quantity and valid price.");
    return { description, quantity, unitPriceCents };
  }) as InvoiceLine[];
  const taxPercent = Number(data.taxPercent ?? 0);
  if (!Number.isInteger(taxPercent) || taxPercent < 0 || taxPercent > 100) throw new Error("Tax percentage must be between 0 and 100.");
  const subtotalCents = lines.reduce((total, line) => total + line.quantity * line.unitPriceCents, 0);
  const taxCents = Math.round(subtotalCents * taxPercent / 100);
  const status = string("status", 12);
  if (!["draft", "issued", "paid", "void"].includes(status)) throw new Error("Choose a valid invoice status.");
  return {
    clientName,
    clientEmail: string("clientEmail", 180),
    clientAddress: string("clientAddress", 500),
    issueDate,
    dueDate,
    lineItems: JSON.stringify(lines),
    subtotalCents,
    taxPercent,
    taxCents,
    totalCents: subtotalCents + taxCents,
    notes: string("notes", 1600),
    status,
  };
}

export function getInvoiceLines(invoice: { lineItems: string }): InvoiceLine[] {
  try { return JSON.parse(invoice.lineItems) as InvoiceLine[]; } catch { return []; }
}

export function formatRand(cents: number) {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
