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
