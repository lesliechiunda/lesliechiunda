import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../lib/admin-auth";
import { parseInvoiceInput } from "../../../../lib/invoice";
import { createInvoice, listInvoices } from "../../../../lib/repository";

export async function GET() {
  if (!await getAdminForApi()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ invoices: await listInvoices() }); }
  catch { return NextResponse.json({ error: "Could not load invoices." }, { status: 503 }); }
}

export async function POST(request: Request) {
  if (!await getAdminForApi()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let values;
  try { values = parseInvoiceInput(await request.json()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid invoice." }, { status: 400 }); }
  try { return NextResponse.json({ invoice: await createInvoice(values) }, { status: 201 }); }
  catch { return NextResponse.json({ error: "Could not create invoice. Please retry." }, { status: 503 }); }
}
