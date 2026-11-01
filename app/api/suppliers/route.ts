import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supplierSchema, purchaseOrderSchema } from "@/schemas";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // 'suppliers' or 'purchases'
  const workshopId = searchParams.get("workshopId") || defaultWorkshopId;

  if (type === "purchases") {
    const purchases = db.getPurchases(workshopId);
    return NextResponse.json({ purchases });
  }

  const suppliers = db.getSuppliers(workshopId);
  const purchases = db.getPurchases(workshopId);
  return NextResponse.json({ suppliers, purchases });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const workshopId = body.workshopId || defaultWorkshopId;

    // Receive goods action
    if (body.action === "receive") {
      const { purchaseId } = body;
      if (!purchaseId) return NextResponse.json({ error: "ID PO wajib disertakan" }, { status: 400 });
      const purchase = db.receivePurchaseGoods(workshopId, purchaseId);
      return NextResponse.json({ purchase });
    }

    // Create Purchase Order action
    if (body.action === "create_po") {
      const validated = purchaseOrderSchema.parse(body);
      const purchase = db.createPurchase(workshopId, validated.supplierId, validated.items, validated.notes);
      return NextResponse.json({ purchase }, { status: 201 });
    }

    // Create Supplier action
    const validated = supplierSchema.parse(body);
    const supplier = db.createSupplier(workshopId, {
      name: validated.name,
      contactPerson: validated.contactPerson,
      phone: validated.phone,
      email: validated.email || undefined,
      address: validated.address || undefined,
    });

    return NextResponse.json({ supplier }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validasi gagal" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Gagal memproses supplier / PO" }, { status: 400 });
  }
}
