import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const metrics = db.getPlatformMetrics();
  const workshops = db.getWorkshops();

  return NextResponse.json({
    metrics,
    workshops,
  });
}

export async function PATCH(req: Request) {
  try {
    const { workshopId, status } = await req.json();

    if (!workshopId || !status) {
      return NextResponse.json({ error: "Workshop ID dan status wajib disertakan" }, { status: 400 });
    }

    const updated = db.updateWorkshopStatus(workshopId, status);
    return NextResponse.json({
      success: true,
      message: `Status bengkel berhasil diperbarui menjadi ${status}`,
      workshop: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memperbarui status bengkel" }, { status: 400 });
  }
}
