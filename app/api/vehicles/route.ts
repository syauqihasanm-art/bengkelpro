import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vehicleSchema } from "@/schemas";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const customerId = searchParams.get("customerId") || undefined;
  const workshopId = searchParams.get("workshopId") || defaultWorkshopId;

  const vehicles = db.getVehicles(workshopId, customerId, search);
  return NextResponse.json({ vehicles });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = vehicleSchema.parse(body);
    const workshopId = body.workshopId || defaultWorkshopId;

    const newVehicle = db.createVehicle(workshopId, {
      customerId: validated.customerId,
      vehicleType: validated.vehicleType,
      brand: validated.brand,
      model: validated.model,
      productionYear: validated.productionYear,
      licensePlate: validated.licensePlate,
      chassisNumber: validated.chassisNumber,
      engineNumber: validated.engineNumber,
      currentOdometer: validated.currentOdometer,
      notes: validated.notes,
    });

    return NextResponse.json({ vehicle: newVehicle }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validasi gagal" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Gagal mendaftarkan kendaraan" }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, workshopId = defaultWorkshopId, ...updates } = body;
    if (!id) return NextResponse.json({ error: "ID kendaraan diperlukan" }, { status: 400 });

    const updated = db.updateVehicle(workshopId, id, updates);
    return NextResponse.json({ vehicle: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memperbarui kendaraan" }, { status: 400 });
  }
}
