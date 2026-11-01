import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mechanicSchema } from "@/schemas";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workshopId = searchParams.get("workshopId") || defaultWorkshopId;

  const mechanics = db.getMechanics(workshopId);
  return NextResponse.json({ mechanics });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = mechanicSchema.parse(body);
    const workshopId = body.workshopId || defaultWorkshopId;

    const mechanic = db.createMechanic(workshopId, {
      name: validated.name,
      phone: validated.phone,
      specialization: validated.specialization,
      status: validated.status,
      rating: 5.0,
    });

    return NextResponse.json({ mechanic }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validasi gagal" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Gagal menambahkan mekanik" }, { status: 400 });
  }
}
