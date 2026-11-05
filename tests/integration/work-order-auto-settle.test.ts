import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";

describe("Work Order Auto-Settle & Immediate Revenue Integration", () => {
  const workshopId = "11111111-1111-4111-8111-111111111111";

  it("completes work order, auto-settles invoice as paid, and immediately increases workshop revenue", () => {
    // 1. Snapshot initial financial metrics
    const financeBefore = db.getFinancialSummary(workshopId);
    const initialRevenue = financeBefore.totalRevenue;
    const initialGrossProfit = financeBefore.grossProfit;

    // 2. Customer & Vehicle
    const customers = db.getCustomers(workshopId);
    expect(customers.length).toBeGreaterThan(0);
    const customer = customers[0];

    const vehicles = db.getVehicles(workshopId, customer.id);
    expect(vehicles.length).toBeGreaterThan(0);
    const vehicle = vehicles[0];

    // 3. Create a Work Order (in waiting or inspection)
    const workOrder = db.createWorkOrder(workshopId, {
      customerId: customer.id,
      vehicleId: vehicle.id,
      odometerIn: 15500,
      customerComplaint: "Servis rutin dan ganti kampas rem",
      items: [
        {
          itemType: "service",
          name: "Jasa Servis Lengkap",
          quantity: 1,
          unitPrice: 85000,
          isApproved: true,
        },
      ],
    });

    expect(workOrder.id).toBeDefined();
    expect(workOrder.status).toBe("waiting");
    expect(workOrder.grandTotal).toBe(85000);

    // 4. Mechanic adds a part
    const products = db.getProducts(workshopId);
    expect(products.length).toBeGreaterThan(0);
    const part = products[0];

    db.addWorkOrderItem(workshopId, workOrder.id, {
      itemType: "part",
      name: part.name,
      quantity: 1,
      unitPrice: part.sellingPrice,
      referenceId: part.id,
      isApproved: true,
    });

    const refreshedWO = db.getWorkOrderById(workshopId, workOrder.id)!;
    expect(refreshedWO.items?.length).toBe(2);
    const expectedTotal = 85000 + part.sellingPrice;
    expect(refreshedWO.grandTotal).toBe(expectedTotal);

    // 5. Complete SPK with autoSettle = true (Simulating clicking "Selesai & Bayar Lunas")
    const completedWO = db.updateWorkOrderStatus(
      workshopId,
      workOrder.id,
      "completed",
      "Pengerjaan selesai dan langsung bayar lunas kasir",
      true // autoSettle = true
    );

    expect(completedWO.status).toBe("completed");
    expect(completedWO.customerApprovalStatus).toBe("approved");

    // 6. Verify Invoice is generated and marked PAID
    const invoices = db.getInvoices(workshopId);
    const invoice = invoices.find((inv) => inv.workOrderId === workOrder.id);
    expect(invoice).toBeDefined();
    expect(invoice?.status).toBe("paid");
    expect(invoice?.paidAmount).toBe(expectedTotal);
    expect(invoice?.totalAmount).toBe(expectedTotal);

    // 7. Verify Payment record exists and is successful
    const storeInvoice = db.getInvoiceById(workshopId, invoice!.id);
    expect(storeInvoice?.payments?.length).toBeGreaterThan(0);
    const payment = storeInvoice?.payments?.[0];
    expect(payment?.status).toBe("success");
    expect(payment?.amount).toBe(expectedTotal);

    // 8. Verify Owner Dashboard financial summary immediately reflects the new revenue
    const financeAfter = db.getFinancialSummary(workshopId);
    expect(financeAfter.totalRevenue).toBe(initialRevenue + expectedTotal);
    expect(financeAfter.serviceRevenue).toBeGreaterThanOrEqual(85000);
    expect(financeAfter.partsRevenue).toBeGreaterThanOrEqual(part.sellingPrice);
    expect(financeAfter.grossProfit).toBe(initialGrossProfit + expectedTotal - part.purchasePrice);
    expect(financeAfter.netProfit).toBe(financeAfter.grossProfit - financeAfter.totalExpenses);
  });
});
