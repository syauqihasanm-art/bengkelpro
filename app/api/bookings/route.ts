import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookingSchema } from "@/schemas";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || undefined;
  const workshopId = searchParams.get("workshopId") || defaultWorkshopId;

  const bookings = db.getBookings(workshopId, date);
  return NextResponse.json({ bookings });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = bookingSchema.parse(body);

    const booking = db.createBooking(validated.workshopId, {
      customerId: validated.customerId,
      vehicleId: validated.vehicleId,
      serviceDate: validated.serviceDate,
      timeSlot: validated.timeSlot,
      customerComplaint: validated.customerComplaint,
      estimatedCost: 0,
      adminNotes: "Booking dibuat oleh Admin Bengkel",
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validasi gagal" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Gagal membuat booking" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, notes, workshopId = defaultWorkshopId } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID dan status wajib disertakan" }, { status: 400 });
    }

    const updated = db.updateBookingStatus(workshopId, id, status, notes);
    return NextResponse.json({ booking: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memperbarui status booking" }, { status: 400 });
  }
}
