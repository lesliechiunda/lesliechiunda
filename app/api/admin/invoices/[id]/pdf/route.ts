import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../../../../lib/admin-auth";
import { createInvoicePdf } from "../../../../../../lib/invoice-pdf";
import { getInvoice } from "../../../../../../lib/repository";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await getAdminForApi()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const invoice = await getInvoice((await context.params).id);
    if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    const pdf = await createInvoicePdf(invoice);
    return new Response(pdf as BodyInit, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${invoice.number}.pdf"`,
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch { return NextResponse.json({ error: "Could not generate the PDF." }, { status: 503 }); }
}
