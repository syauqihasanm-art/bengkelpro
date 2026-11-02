import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customerSchema } from "@/schemas";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const workshopId = searchParams.get("workshopId") || defaultWorkshopId;

  const customers = db.getCustomers(workshopId, search);
  return NextResponse.json({ customers });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = customerSchema.parse(body);
    const workshopId = body.workshopId || defaultWorkshopId;

    const newCustomer = db.createCustomer(workshopId, {
      fullName: validated.fullName,
      phone: validated.phone,
      email: validated.email || undefined,
      address: validated.address || undefined,
      notes: validated.notes || undefined,
    });

    return NextResponse.json({ customer: newCustomer }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validasi gagal" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Gagal membuat customer" }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, workshopId = defaultWorkshopId, ...updates } = body;
    if (!id) return NextResponse.json({ error: "ID pelanggan diperlukan" }, { status: 400 });

    const updated = db.updateCustomer(workshopId, id, updates);
    return NextResponse.json({ customer: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memperbarui pelanggan" }, { status: 400 });
  }
}
