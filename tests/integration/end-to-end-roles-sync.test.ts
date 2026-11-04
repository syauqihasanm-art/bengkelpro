import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";

describe("BengkelPro End-to-End Roles & Financial Synchronization", () => {
  const workshopId = "11111111-1111-4111-8111-111111111111";

  it("completes full end-to-end lifecycle across all 5 roles with real-time financial sync", () => {
    // -------------------------------------------------------------
    // Initial Snapshot: Owner Financial Baseline
    // -------------------------------------------------------------
    const baselineFinance = db.getFinancialSummary(workshopId);
    expect(baselineFinance).toBeDefined();
    const initialRevenue = baselineFinance.totalRevenue;
    const initialCOGS = baselineFinance.cogs;
    const initialGross = baselineFinance.grossProfit;

    // -------------------------------------------------------------
    // ROLE 1: PELANGGAN (CUSTOMER)
    // Register vehicle and create a service booking
    // -------------------------------------------------------------
    const customers = db.getCustomers(workshopId);
    expect(customers.length).toBeGreaterThan(0);
    const customer = customers[0];

    const newVehicle = db.createVehicle(workshopId, {
      customerId: customer.id,
      vehicleType: "motor",
      brand: "Yamaha",
      model: "NMAX 155 Connected",
      productionYear: 2024,
      licensePlate: "B 9999 E2E",
      currentOdometer: 12000,
    });
    expect(newVehicle.id).toBeDefined();
    expect(newVehicle.licensePlate).toBe("B 9999 E2E");

    const newBooking = db.createBooking(workshopId, {
      customerId: customer.id,
      vehicleId: newVehicle.id,
      serviceDate: "2026-11-20",
      timeSlot: "10:00 - 11:00",
      customerComplaint: "Servis CVT berkala dan ganti oli mesin Shell",
    });
    expect(newBooking.id).toBeDefined();
    expect(newBooking.status).toBe("pending");

    // -------------------------------------------------------------
    // ROLE 2: ADMIN / KASIR
    // Confirm booking and convert to Work Order (SPK)
    // -------------------------------------------------------------
    const confirmedBooking = db.updateBookingStatus(workshopId, newBooking.id, "confirmed");
    expect(confirmedBooking.status).toBe("confirmed");

    const workOrder = db.createWorkOrder(workshopId, {
      bookingId: newBooking.id,
      customerId: customer.id,
      vehicleId: newVehicle.id,
      odometerIn: 12050,
      customerComplaint: newBooking.customerComplaint,
      inspectionFindings: "Throttle body kotor, v-belt ada keretakan halus",
      items: [
        {
          itemType: "service",
          name: "Jasa Servis CVT & Injeksi",
          quantity: 1,
          unitPrice: 80000,
          isApproved: true,
        },
      ],
    });
    expect(workOrder.id).toBeDefined();
    expect(workOrder.workOrderNumber).toMatch(/^WO-\d{4}-\d{4}$/);
    expect(workOrder.subtotal).toBe(80000);

    // -------------------------------------------------------------
    // ROLE 3: MEKANIK
    // Start job, record findings, and add parts from inventory
    // -------------------------------------------------------------
    // Approve and start progress
    workOrder.customerApprovalStatus = "approved";
    const startedWO = db.updateWorkOrderStatus(workshopId, workOrder.id, "in_progress", "Mulai servis CVT");
    expect(startedWO.status).toBe("in_progress");

    // Mechanic adds spare part: Shell Advance AX7
    const products = db.getProducts(workshopId, "Shell Advance");
    expect(products.length).toBeGreaterThan(0);
    const oilProduct = products[0];
    const stockBefore = oilProduct.stockQuantity;

    const updatedWO = db.addWorkOrderItem(workshopId, workOrder.id, {
      itemType: "part",
      referenceId: oilProduct.id,
      name: oilProduct.name,
      quantity: 1,
      unitPrice: oilProduct.sellingPrice,
      isApproved: true,
    });

    expect(updatedWO.items?.length).toBe(2);
    expect(updatedWO.totalLabor).toBe(80000);
    expect(updatedWO.totalParts).toBe(oilProduct.sellingPrice);
    expect(updatedWO.grandTotal).toBe(80000 + oilProduct.sellingPrice);

    // Inventory check: stock deducted safely
    const productAfter = db.getProductById(workshopId, oilProduct.id);
    expect(productAfter?.stockQuantity).toBe(stockBefore - 1);

    // Mechanic finishes repair
    const completedWO = db.updateWorkOrderStatus(
      workshopId,
      workOrder.id,
      "completed",
      "Pengerjaan CVT selesai, oli mesin telah diganti baru."
    );
    expect(completedWO.status).toBe("completed");

    // -------------------------------------------------------------
    // ROLE 2 (Cont.): ADMIN / KASIR
    // Receive completed WO invoice, collect customer payment
    // -------------------------------------------------------------
    const invoices = db.getInvoices(workshopId);
    const generatedInvoice = invoices.find((inv) => inv.workOrderId === workOrder.id);
    expect(generatedInvoice).toBeDefined();
    expect(generatedInvoice?.totalAmount).toBe(80000 + oilProduct.sellingPrice);
    expect(generatedInvoice?.status).toBe("unpaid");

    // Customer pays in full via QRIS
    const payment = db.recordPayment(workshopId, {
      invoiceId: generatedInvoice!.id,
      amount: generatedInvoice!.totalAmount,
      paymentMethod: "qris",
      notes: "Pelanggan membayar via QRIS di meja kasir",
      idempotencyKey: `E2E-TEST-${Date.now()}`,
    });
    expect(payment.id).toBeDefined();
    expect(payment.status).toBe("success");

    const paidInvoice = db.getInvoiceById(workshopId, generatedInvoice!.id);
    expect(paidInvoice?.status).toBe("paid");
    expect(paidInvoice?.paidAmount).toBe(generatedInvoice!.totalAmount);

    // -------------------------------------------------------------
    // ROLE 4: OWNER (REAL-TIME FINANCIAL SYNC VERIFICATION)
    // -------------------------------------------------------------
    const financeAfter = db.getFinancialSummary(workshopId);
    expect(financeAfter.totalRevenue).toBe(initialRevenue + generatedInvoice!.totalAmount);
    expect(financeAfter.serviceRevenue).toBeGreaterThanOrEqual(80000);
    expect(financeAfter.partsRevenue).toBeGreaterThanOrEqual(oilProduct.sellingPrice);
    // COGS increased by the unitCost of the deducted oil
    expect(financeAfter.cogs).toBe(initialCOGS + oilProduct.purchasePrice);
    // Gross profit equals total revenue minus cogs
    expect(financeAfter.grossProfit).toBe(financeAfter.totalRevenue - financeAfter.cogs);
    expect(financeAfter.netProfit).toBe(financeAfter.grossProfit - financeAfter.totalExpenses);

    // -------------------------------------------------------------
    // ROLE 5: SUPER ADMIN (PLATFORM DIRECTORY & VERIFICATION)
    // -------------------------------------------------------------
    const newMitra = db.createWorkshop({
      name: "Bengkel Sentosa Abadi",
      slug: "sentosa-abadi",
      ownerId: "22222222-2222-4222-8222-222222222222",
      phone: "081399887766",
      email: "sentosa@bengkel.com",
      workshopType: "motor",
      address: "Jl. Margonda Raya No. 10, Depok",
      city: "Depok",
      province: "Jawa Barat",
      status: "pending",
      subscriptionTier: "free",
      capacityPerDay: 12,
      isPublicListed: true,
    });
    expect(newMitra.id).toBeDefined();
    expect(newMitra.status).toBe("pending");

    const approvedMitra = db.updateWorkshopStatus(newMitra.id, "approved");
    expect(approvedMitra.status).toBe("approved");

    const platformMetrics = db.getPlatformMetrics();
    expect(platformMetrics.totalWorkshops).toBeGreaterThanOrEqual(2);
    expect(platformMetrics.approvedWorkshops).toBeGreaterThanOrEqual(2);
  });
});
