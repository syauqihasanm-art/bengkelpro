import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";

const workshopId = "11111111-1111-4111-8111-111111111111";

describe("Inventory & Safe Stock Movements", () => {
  it("creates a product and records initial stock movement", () => {
    const sku = `TEST-OIL-${Date.now()}`;
    const product = db.createProduct(workshopId, {
      sku,
      name: "Oli Uji Laboratorium 10W-30",
      brand: "TestBrand",
      purchasePrice: 40000,
      sellingPrice: 55000,
      stockQuantity: 10,
      minStock: 2,
      unit: "botol",
    });

    expect(product.id).toBeDefined();
    expect(product.stockQuantity).toBe(10);

    const movements = db.getStockMovements(workshopId, product.id);
    expect(movements.length).toBeGreaterThanOrEqual(1);
    expect(movements[0].currentStock).toBe(10);
    expect(movements[0].movementType).toBe("in");
  });

  it("adjusts stock upwards and records movement", () => {
    const products = db.getProducts(workshopId);
    const target = products[0];
    const prevStock = target.stockQuantity;

    const updated = db.adjustStock(workshopId, target.id, "in", 5, "Penyesuaian stok uji coba");

    expect(updated.stockQuantity).toBe(prevStock + 5);
  });

  it("throws error and prevents negative stock when deducting more than available", () => {
    const products = db.getProducts(workshopId);
    const target = products[0];

    expect(() => {
      db.adjustStock(workshopId, target.id, "out", target.stockQuantity + 999, "Uji pengurangan berlebih");
    }).toThrow(/tidak mencukupi/i);
  });
});
