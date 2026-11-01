import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";

const workshopId = "11111111-1111-4111-8111-111111111111";

describe("Booking System & Capacity Enforcement", () => {
  it("prevents double booking the same vehicle on the same date", () => {
    const customers = db.getCustomers(workshopId);
    const vehicles = db.getVehicles(workshopId, customers[0].id);
    const testDate = "2026-11-20";

    // First booking
    db.createBooking(workshopId, {
      customerId: customers[0].id,
      vehicleId: vehicles[0].id,
      serviceDate: testDate,
      timeSlot: "09:00 - 10:00",
      customerComplaint: "Servis rutin pertama",
      estimatedCost: 0,
    });

    // Attempt double booking
    expect(() => {
      db.createBooking(workshopId, {
        customerId: customers[0].id,
        vehicleId: vehicles[0].id,
        serviceDate: testDate,
        timeSlot: "14:00 - 15:00",
        customerComplaint: "Mencoba booking kedua di hari yang sama",
        estimatedCost: 0,
      });
    }).toThrow(/sudah memiliki jadwal booking/i);
  });
});
