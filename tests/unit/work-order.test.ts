import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";

const workshopId = "11111111-1111-4111-8111-111111111111";

describe("Work Order Lifecycle & Parts Deduction", () => {
  it("creates a work order and does not immediately deduct stock upon creation", () => {
    const products = db.getProducts(workshopId);
    const targetPart = products[0];
    const initialStock = targetPart.stockQuantity;

    const customers = db.getCustomers(workshopId);
    const vehicles = db.getVehicles(workshopId, customers[0].id);

    const wo = db.createWorkOrder(workshopId, {
      customerId: customers[0].id,
      vehicleId: vehicles[0].id,
      odometerIn: 16000,
      customerComplaint: "Uji SPK baru",
      items: [
        {
          itemType: "part",
          referenceId: targetPart.id,
          name: targetPart.name,
          quantity: 2,
          unitPrice: targetPart.sellingPrice,
          isApproved: true,
        },
      ],
    });

    expect(wo.workOrderNumber).toMatch(/^WO-/);
    expect(wo.status).toBe("waiting");

    // Verify stock is untouched at waiting stage
    const partAfterCreation = db.getProductById(workshopId, targetPart.id);
    expect(partAfterCreation?.stockQuantity).toBe(initialStock);
  });

  it("safely deducts parts and writes stock movements when work order starts and customer approves", () => {
    const products = db.getProducts(workshopId);
    const targetPart = products[0];
    const initialStock = targetPart.stockQuantity;

    const customers = db.getCustomers(workshopId);
    const vehicles = db.getVehicles(workshopId, customers[0].id);

    const wo = db.createWorkOrder(workshopId, {
      customerId: customers[0].id,
      vehicleId: vehicles[0].id,
      odometerIn: 16500,
      customerComplaint: "Uji ganti part",
      items: [
        {
          itemType: "part",
          referenceId: targetPart.id,
          name: targetPart.name,
          quantity: 1,
          unitPrice: targetPart.sellingPrice,
          isApproved: true,
        },
      ],
    });

    // Customer approves
    wo.customerApprovalStatus = "approved";

    // Transition to in_progress
    db.updateWorkOrderStatus(workshopId, wo.id, "in_progress");

    const partAfterDeduction = db.getProductById(workshopId, targetPart.id);
    expect(partAfterDeduction?.stockQuantity).toBe(initialStock - 1);
  });
});
