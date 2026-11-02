import { test, expect } from "@playwright/test";

test.describe("BengkelPro Interactive Modals & End-to-End Actions", () => {
  test("Owner Work Orders: opens interactive detail modal and displays items & print button", async ({ page }) => {
    await page.goto("http://localhost:3000/owner/work-orders");
    await page.waitForSelector("table tbody tr");

    // Click the first "Detail" button
    const detailBtn = page.locator("button:has-text('Detail')").first();
    await expect(detailBtn).toBeVisible();
    await detailBtn.click();

    // Check modal visibility
    await expect(page.locator("h4:has-text('Daftar Pekerjaan & Penggunaan Suku Cadang')")).toBeVisible();
    await expect(page.locator("button:has-text('Cetak Lembar SPK')")).toBeVisible();
    await expect(page.locator("button:has-text('Tutup')")).toBeVisible();

    // Close modal
    await page.locator("button:has-text('Tutup')").click();
  });

  test("Owner Customers: opens customer detail modal showing contact and garage", async ({ page }) => {
    await page.goto("http://localhost:3000/owner/customers");
    await page.waitForSelector("table tbody tr");

    // Click "Detail" button on first customer
    const detailBtn = page.locator("button:has-text('Detail')").first();
    await expect(detailBtn).toBeVisible();
    await detailBtn.click();

    // Verify modal content
    await expect(page.locator("text=Unit Kendaraan Terdaftar")).toBeVisible();
    await expect(page.locator("text=Total Akumulasi Transaksi")).toBeVisible();

    // Close modal
    await page.locator("button:has-text('Tutup')").click();
  });

  test("Owner Vehicles: opens Buku Servis digital modal showing vehicle specs & history", async ({ page }) => {
    await page.goto("http://localhost:3000/owner/vehicles");
    await page.waitForSelector("table tbody tr");

    // Click "Buku Servis" button
    const bukuServisBtn = page.locator("button:has-text('Buku Servis')").first();
    await expect(bukuServisBtn).toBeVisible();
    await bukuServisBtn.click();

    // Check modal
    await expect(page.locator("h3:has-text('Buku Servis Digital')")).toBeVisible();
    await expect(page.locator("text=Riwayat Servis & Perbaikan")).toBeVisible();

    // Close modal
    await page.locator("button:has-text('Tutup')").click();
  });

  test("Owner Reports: displays Export Excel and Print buttons", async ({ page }) => {
    await page.goto("http://localhost:3000/owner/reports");
    await expect(page.locator("h1:has-text('Laporan Finansial & Laba Bersih')")).toBeVisible();

    // Check export buttons
    await expect(page.locator("button:has-text('Export Excel (.xlsx)')")).toBeVisible();
    await expect(page.locator("button:has-text('Cetak / PDF')")).toBeVisible();
    await expect(page.locator("button:has-text('CSV')")).toBeVisible();
  });

  test("Super Admin: Verifikasi & Pendaftaran Bengkel works with decision buttons", async ({ page }) => {
    await page.goto("http://localhost:3000/super-admin/registrations");
    await expect(page.locator("h1:has-text('Verifikasi & Pendaftaran Bengkel')")).toBeVisible();

    // Toggle filter to 'Semua'
    await page.locator("button:has-text('Semua')").click();
    await page.waitForSelector("table tbody tr");
    await expect(page.locator("table tbody tr").first()).toBeVisible();
  });

  test("Customer: Garasi Kendaraan allows viewing and opening registration modal", async ({ page }) => {
    await page.goto("http://localhost:3000/customer/vehicles");
    await expect(page.locator("h1:has-text('Garasi Kendaraan Saya')")).toBeVisible();

    // Click add vehicle button
    await page.locator("button:has-text('Daftarkan Kendaraan Baru')").click();
    await expect(page.locator("h3:has-text('Daftarkan Kendaraan Baru')")).toBeVisible();
    await page.locator("button:has-text('Batal')").click();
  });
});
