import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workshopSlug, fullName, phone, vehicleType, brand, model, licensePlate, serviceDate, timeSlot, complaint } = body;

    if (!workshopSlug || !fullName || !phone || !brand || !model || !licensePlate || !serviceDate || !timeSlot || !complaint) {
      return NextResponse.json({ error: "Seluruh kolom wajib diisi." }, { status: 400 });
    }

    const workshop = db.getWorkshopBySlug(workshopSlug);
    if (!workshop) {
      return NextResponse.json({ error: "Bengkel tidak ditemukan." }, { status: 404 });
    }

    // Find or create customer
    let customers = db.getCustomers(workshop.id);
    let customer = customers.find((c) => c.phone === phone);

    if (!customer) {
      customer = db.createCustomer(workshop.id, {
        fullName,
        phone,
        email: "",
        address: "",
        notes: "Didaftarkan otomatis melalui booking publik online",
      });
    }

    // Find or create vehicle
    let vehicles = db.getVehicles(workshop.id, customer.id);
    let vehicle = vehicles.find((v) => v.licensePlate === licensePlate.toUpperCase().trim());

    if (!vehicle) {
      vehicle = db.createVehicle(workshop.id, {
        customerId: customer.id,
        vehicleType: (vehicleType as any) || "motor",
        brand,
        model,
        licensePlate: licensePlate.toUpperCase().trim(),
        currentOdometer: 0,
        notes: "Ditambahkan melalui booking online",
      });
    }

    // Create booking
    const booking = db.createBooking(workshop.id, {
      customerId: customer.id,
      vehicleId: vehicle.id,
      serviceDate,
      timeSlot,
      customerComplaint: complaint,
      estimatedCost: 0,
      adminNotes: "Booking online via web publik",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking berhasil dibuat.",
        bookingCode: booking.bookingCode,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal membuat booking." }, { status: 400 });
  }
}
