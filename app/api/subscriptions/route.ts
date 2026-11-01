import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workshopId = searchParams.get("workshopId") || defaultWorkshopId;

  const subscription = db.getSubscription(workshopId);
  return NextResponse.json({ subscription });
}

export async function POST(req: Request) {
  try {
    const { planCode, workshopId = defaultWorkshopId } = await req.json();

    if (!["free", "basic", "pro", "business"].includes(planCode)) {
      return NextResponse.json({ error: "Paket langganan tidak valid" }, { status: 400 });
    }

    const updated = db.upgradeSubscription(workshopId, planCode);
    return NextResponse.json({
      success: true,
      message: `Langganan berhasil diubah ke paket ${planCode.toUpperCase()}`,
      subscription: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal mengubah langganan" }, { status: 400 });
  }
}
