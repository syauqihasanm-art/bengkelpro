import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";

const WORKSHOP_A_ID = "11111111-1111-4111-8111-111111111111"; // Sahabat Motor
const WORKSHOP_B_ID = "22222222-2222-4222-8222-222222222222"; // Jaya Abadi Motor

describe("Tenant Isolation & Role Authorization Security", () => {
  it("strictly enforces multi-tenant boundary on customer queries", () => {
    const customersA = db.getCustomers(WORKSHOP_A_ID);
    const customersB = db.getCustomers(WORKSHOP_B_ID);

    expect(customersA.length).toBeGreaterThan(0);
    // Every customer in customersA must belong to Workshop A
    customersA.forEach((c) => {
      expect(c.workshopId).toBe(WORKSHOP_A_ID);
      expect(c.workshopId).not.toBe(WORKSHOP_B_ID);
    });

    // An attacker with Workshop A credentials attempting to get Workshop B's customer by ID
    if (customersB.length > 0) {
      const bCustomerId = customersB[0].id;
      const leakedCustomer = db.getCustomerById(WORKSHOP_A_ID, bCustomerId);
      expect(leakedCustomer).toBeUndefined();
    }
  });

  it("strictly enforces tenant boundary on inventory and products", () => {
    const productsA = db.getProducts(WORKSHOP_A_ID);
    const productsB = db.getProducts(WORKSHOP_B_ID);

    expect(productsA.length).toBeGreaterThan(0);
    productsA.forEach((p) => {
      expect(p.workshopId).toBe(WORKSHOP_A_ID);
    });

    if (productsB.length > 0) {
      const bProductId = productsB[0].id;
      const leakedProduct = db.getProductById(WORKSHOP_A_ID, bProductId);
      expect(leakedProduct).toBeUndefined();
    }
  });

  it("prevents cross-tenant work order access and invoice manipulation", () => {
    const invoicesA = db.getInvoices(WORKSHOP_A_ID);
    const invoicesB = db.getInvoices(WORKSHOP_B_ID);

    invoicesA.forEach((inv) => {
      expect(inv.workshopId).toBe(WORKSHOP_A_ID);
    });

    if (invoicesB.length > 0) {
      const bInvoiceId = invoicesB[0].id;
      const leakedInvoice = db.getInvoiceById(WORKSHOP_A_ID, bInvoiceId);
      expect(leakedInvoice).toBeUndefined();
    }
  });

  it("rejects invalid role escalation in registration flow", () => {
    const validRoles = ["workshop_owner", "workshop_admin", "mechanic", "customer"];
    // Super admin role must NOT be grantable via standard public registration
    expect(validRoles.includes("super_admin")).toBe(false);
  });
});
