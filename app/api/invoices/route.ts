import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentSchema } from "@/schemas";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const workshopId = searchParams.get("workshopId") || defaultWorkshopId;

  if (id) {
    const invoice = db.getInvoiceById(workshopId, id);
    if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ invoice });
  }

  const invoices = db.getInvoices(workshopId);
  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = paymentSchema.parse(body);
    const workshopId = body.workshopId || defaultWorkshopId;

    const payment = db.recordPayment(workshopId, {
      invoiceId: validated.invoiceId,
      amount: validated.amount,
      paymentMethod: validated.paymentMethod,
      notes: validated.notes,
      externalReference: validated.externalReference,
      idempotencyKey: body.idempotencyKey,
    });

    const updatedInvoice = db.getInvoiceById(workshopId, validated.invoiceId);
    return NextResponse.json({ payment, invoice: updatedInvoice }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validasi gagal" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Gagal mencatat pembayaran" }, { status: 400 });
  }
}
