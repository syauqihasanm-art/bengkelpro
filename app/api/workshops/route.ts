import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const id = searchParams.get("id");

  if (slug) {
    const workshop = db.getWorkshopBySlug(slug);
    if (!workshop) {
      return NextResponse.json({ error: "Bengkel tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ workshop });
  }

  if (id) {
    const workshop = db.getWorkshopById(id);
    if (!workshop) {
      return NextResponse.json({ error: "Bengkel tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ workshop });
  }

  const workshops = db.getWorkshops();
  return NextResponse.json({ workshops });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, phone, address, city, capacityPerDay, description } = body;
    if (!id) {
      return NextResponse.json({ error: "Workshop ID is required" }, { status: 400 });
    }

    const safeUpdates: Record<string, any> = {};
    if (name !== undefined) safeUpdates.name = String(name);
    if (phone !== undefined) safeUpdates.phone = String(phone);
    if (address !== undefined) safeUpdates.address = String(address);
    if (city !== undefined) safeUpdates.city = String(city);
    if (capacityPerDay !== undefined) safeUpdates.capacityPerDay = Number(capacityPerDay) || 10;
    if (description !== undefined) safeUpdates.description = String(description);

    const updated = db.updateWorkshop(id, safeUpdates);
    return NextResponse.json({ workshop: updated, message: "Pengaturan bengkel berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update workshop" }, { status: 500 });
  }
}
