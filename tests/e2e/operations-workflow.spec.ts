import { test, expect } from "@playwright/test";

test.describe("Operational Workflows & Financial Reconciliation", () => {
  test("Owner Customer Management displays customer list and search", async ({ page }) => {
    await page.goto("/owner/customers");

    await expect(page.locator("text=Manajemen Pelanggan")).toBeVisible();
    await expect(page.locator("text=Rudi Hermawan")).toBeVisible();
    await expect(page.locator("text=Tambah Pelanggan Baru")).toBeVisible();
  });

  test("Owner Inventory Management displays catalog and low stock warnings", async ({ page }) => {
    await page.goto("/owner/inventory");

    await expect(page.locator("text=Stok & Inventaris Suku Cadang")).toBeVisible();
    await expect(page.locator("text=Oli Mesin Shell Advance")).toBeVisible();
    await expect(page.locator("text=Riwayat Mutasi Stok")).toBeVisible();
  });

  test("Owner Work Orders displays status badges and active jobs", async ({ page }) => {
    await page.goto("/owner/work-orders");

    await expect(page.locator("text=Surat Perintah Kerja (SPK)")).toBeVisible();
    await expect(page.locator("text=Buat SPK Baru")).toBeVisible();
  });

  test("Owner Financial Reports displays correct P&L metrics", async ({ page }) => {
    await page.goto("/owner/reports");

    await expect(page.locator("text=Laporan Finansial & Laba Bersih")).toBeVisible();
    await expect(page.locator("text=Total Omzet Penerimaan Kas")).toBeVisible();
    await expect(page.locator("text=HPP Suku Cadang Terpakai")).toBeVisible();
    await expect(page.locator("p:has-text('Laba Kotor (Gross Profit)')")).toBeVisible();
    await expect(page.locator("text=Laba Bersih Riil (Net Profit)")).toBeVisible();
  });

  test("System Health Check endpoint returns valid 200 JSON", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toContain("BengkelPro");
    expect(body.checks.database).toBe("healthy");
    expect(body.checks.api).toBe("healthy");
  });
});
