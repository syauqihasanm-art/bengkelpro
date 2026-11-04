import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId") || "11111111-1111-4111-8111-111111111111";
    const vehicleId = searchParams.get("vehicleId") || undefined;

    const rawHistories = db.getServiceHistories(workshopId, vehicleId);

    const histories = rawHistories.map((h) => {
      const vehicle = db.getVehicleById(workshopId, h.vehicleId);
      const vehicleName = vehicle
        ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`
        : "Kendaraan Bermotor";
      return {
        ...h,
        vehicleName,
      };
    });

    return NextResponse.json({ histories });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch service history" },
      { status: 500 }
    );
  }
}
