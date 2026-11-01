import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workshopId = searchParams.get("workshopId") || defaultWorkshopId;

  const summary = db.getFinancialSummary(workshopId);
  return NextResponse.json({ summary });
}
