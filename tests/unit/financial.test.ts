import { describe, it, expect } from "vitest";
import { calculateTotals, formatRupiah } from "@/lib/utils";

describe("Financial Operations & Accuracy", () => {
  it("correctly calculates subtotal, discount, tax, and grand total", () => {
    const items = [
      { quantity: 2, unitPrice: 50000 }, // 100,000
      { quantity: 1, unitPrice: 75000 }, // 75,000
    ];
    const discount = 15000;
    const taxRate = 11; // PPN 11%

    const result = calculateTotals(items, discount, taxRate);

    expect(result.subtotal).toBe(175000);
    expect(result.discountAmount).toBe(15000);
    const afterDiscount = 160000;
    expect(result.taxAmount).toBe(Math.round(afterDiscount * 0.11)); // 17,600
    expect(result.grandTotal).toBe(160000 + 17600); // 177,600
  });

  it("handles negative discount and zero quantities safely", () => {
    const items = [
      { quantity: -2, unitPrice: 50000 },
      { quantity: 0, unitPrice: 100000 },
    ];
    const result = calculateTotals(items, -5000, 0);

    expect(result.subtotal).toBe(0);
    expect(result.discountAmount).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  it("formats Indonesian Rupiah properly with thousand separators", () => {
    expect(formatRupiah(150000)).toMatch(/Rp\s?150\.000/);
    expect(formatRupiah(0)).toMatch(/Rp\s?0/);
    expect(formatRupiah(null)).toMatch(/Rp\s?0/);
  });
});
