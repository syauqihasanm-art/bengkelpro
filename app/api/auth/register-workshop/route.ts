import { NextResponse } from "next/server";
import { registerWorkshopSchema } from "@/schemas";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerWorkshopSchema.parse(body);

    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check slug uniqueness
    const existing = db.getWorkshopBySlug(slug);
    const finalSlug = existing ? `${slug}-${Math.floor(1000 + Math.random() * 9000)}` : slug;

    const ownerId = crypto.randomUUID();

    const workshop = db.createWorkshop({
      name: validated.name,
      slug: finalSlug,
      ownerId,
      phone: validated.phone,
      email: validated.email,
      workshopType: validated.workshopType,
      address: validated.address,
      city: validated.city,
      province: validated.province,
      description: validated.description || "",
      status: "approved", // Automatically approve for instant testing / MVP readiness
      subscriptionTier: "free",
      capacityPerDay: 15,
      isPublicListed: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bengkel berhasil didaftarkan.",
        workshop,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validasi gagal" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Gagal memproses pendaftaran" }, { status: 500 });
  }
}
