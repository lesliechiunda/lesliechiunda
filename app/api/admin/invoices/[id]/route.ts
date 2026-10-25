import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../../lib/admin-auth";
import { parseInvoiceInput } from "../../../../../lib/invoice";
import { deleteInvoice, getInvoice, updateInvoice } from "../../../../../lib/repository";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!await getAdminForApi()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let values;
  try { values = parseInvoiceInput(await request.json()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid invoice." }, { status: 400 }); }
  try {
    const invoice = await updateInvoice((await context.params).id, values);
    return invoice ? NextResponse.json({ invoice }) : NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  } catch { return NextResponse.json({ error: "Could not save invoice." }, { status: 503 }); }
}

export async function DELETE(_request: Request, context: Context) {
  if (!await getAdminForApi()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const id = (await context.params).id;
    const current = await getInvoice(id);
    if (current && current.status !== "draft") return NextResponse.json({ error: "Only draft invoices can be deleted. Mark an issued invoice void to retain its record." }, { status: 409 });
    const invoice = await deleteInvoice(id);
    return invoice ? NextResponse.json({ deleted: true }) : NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  } catch { return NextResponse.json({ error: "Could not delete invoice." }, { status: 503 }); }
}
