import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";

const workshopId = "11111111-1111-4111-8111-111111111111";

describe("Integration: Full End-to-End Automotive Service Cycle", () => {
  it("executes complete lifecycle from customer arrival to payment & financial reconciliation", () => {
    // 1. Create Customer
    const phone = `0819${Math.floor(10000000 + Math.random() * 90000000)}`;
    const customer = db.createCustomer(workshopId, {
      fullName: "Bambang Pamungkas",
      phone,
      email: "bambang@gmail.com",
      address: "Jl. Senayan No. 20, Jakarta",
    });
    expect(customer.id).toBeDefined();

    // 2. Register Vehicle
    const plate = `B ${Math.floor(1000 + Math.random() * 9000)} BP`;
    const vehicle = db.createVehicle(workshopId, {
      customerId: customer.id,
      vehicleType: "motor",
      brand: "Honda",
      model: "PCX 160",
      productionYear: 2024,
      licensePlate: plate,
      currentOdometer: 8500,
    });
    expect(vehicle.id).toBeDefined();

    // 3. Create Booking
    const booking = db.createBooking(workshopId, {
      customerId: customer.id,
      vehicleId: vehicle.id,
      serviceDate: "2026-11-25",
      timeSlot: "10:00 - 11:00",
      customerComplaint: "Servis berkala 8.500 km dan ganti oli",
    });
    expect(booking.bookingCode).toMatch(/^BKG-/);

    // 4. Confirm Booking
    const confirmedBooking = db.updateBookingStatus(workshopId, booking.id, "confirmed");
    expect(confirmedBooking.status).toBe("confirmed");

    // 5. Create Work Order
    const products = db.getProducts(workshopId);
    const oilPart = products[0];
    const initialOilStock = oilPart.stockQuantity;

    const wo = db.createWorkOrder(workshopId, {
      bookingId: booking.id,
      customerId: customer.id,
      vehicleId: vehicle.id,
      odometerIn: 8500,
      customerComplaint: booking.customerComplaint,
      inspectionFindings: "Kondisi mesin bagus, oli mesin wajib ganti.",
      items: [
        {
          itemType: "service",
          name: "Jasa Ganti Oli Mesin",
          quantity: 1,
          unitPrice: 20000,
          isApproved: true,
        },
        {
          itemType: "part",
          referenceId: oilPart.id,
          name: oilPart.name,
          quantity: 1,
          unitPrice: oilPart.sellingPrice,
          isApproved: true,
        },
      ],
    });
    expect(wo.workOrderNumber).toMatch(/^WO-/);

    // 6. Customer Approval
    wo.customerApprovalStatus = "approved";

    // 7. Transition to in_progress -> verifies stock deduction
    db.updateWorkOrderStatus(workshopId, wo.id, "in_progress");
    const oilAfterStart = db.getProductById(workshopId, oilPart.id);
    expect(oilAfterStart?.stockQuantity).toBe(initialOilStock - 1);

    // 8. Complete Work Order -> verifies invoice auto-generation
    db.updateWorkOrderStatus(workshopId, wo.id, "completed");
    const invoices = db.getInvoices(workshopId);
    const invoice = invoices.find((inv) => inv.workOrderId === wo.id);
    expect(invoice).toBeDefined();
    expect(invoice?.status).toBe("unpaid");
    expect(invoice?.totalAmount).toBe(20000 + oilPart.sellingPrice);

    // 9. Record Cashier Payment
    const payment = db.recordPayment(workshopId, {
      invoiceId: invoice!.id,
      amount: invoice!.totalAmount,
      paymentMethod: "qris",
      notes: "Pembayaran lunas kasir QRIS",
    });
    expect(payment.status).toBe("success");

    const updatedInvoice = db.getInvoiceById(workshopId, invoice!.id);
    expect(updatedInvoice?.status).toBe("paid");
    expect(updatedInvoice?.paidAmount).toBe(invoice!.totalAmount);

    // 10. Check Service History
    const histories = db.getServiceHistories(workshopId, vehicle.id);
    expect(histories.length).toBeGreaterThanOrEqual(1);
    expect(histories[0].odometer).toBe(8500);

    // 11. Check Financial Summary Reconciliation
    const summary = db.getFinancialSummary(workshopId);
    expect(summary.totalRevenue).toBeGreaterThanOrEqual(invoice!.totalAmount);
    expect(summary.grossProfit).toBe(summary.totalRevenue - summary.cogs);
    expect(summary.netProfit).toBe(summary.grossProfit - summary.totalExpenses);
  });
});
