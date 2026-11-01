import { test, expect } from "@playwright/test";

test.describe("Public Website and Online Booking Flow", () => {
  test("Landing page loads successfully with key sections", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BengkelPro/);

    // Verify brand tagline & navigation
    await expect(page.locator("h1:has-text('Kelola Bengkel Lebih')")).toBeVisible();
    await expect(page.locator("text=Mulai Sekarang (Gratis)")).toBeVisible();

    // Verify key sections are present
    await expect(page.locator("text=Fitur Komprehensif")).toBeVisible();
    await expect(page.locator("text=Transparan & Terjangkau")).toBeVisible();
  });

  test("Features, pricing, and contact pages load", async ({ page }) => {
    await page.goto("/features");
    await expect(page.locator("text=Fitur Terbaik Dirancang")).toBeVisible();

    await page.goto("/pricing");
    await expect(page.locator("text=Paket Berlangganan Fleksibel")).toBeVisible();

    await page.goto("/contact");
    await expect(page.locator("text=Hubungi Tim BengkelPro")).toBeVisible();
  });

  test("Public booking page loads workshop details and handles submission", async ({ page }) => {
    await page.goto("/booking/sahabat-motor");

    // Workshop name verification
    await expect(page.locator("text=Bengkel Sahabat Motor")).toBeVisible();

    // Fill booking form with unique plate and phone
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const testPlate = `B ${randomSuffix} TST`;

    await page.fill('input[placeholder="Contoh: Budi Santoso"]', "E2E Tester Pelanggan");
    await page.fill('input[type="tel"]', `0812999${randomSuffix}`);
    await page.fill('input[placeholder="Honda / Yamaha / Toyota"]', "Honda");
    await page.fill('input[placeholder="Vario 160 / Avanza"]', "Vario 160");
    await page.fill('input[placeholder="B 1234 XYZ"]', testPlate);
    await page.fill('textarea[placeholder*="Jelaskan keluhan"]', "Uji coba otomatis booking Playwright");

    // Submit booking
    await page.click('button:has-text("Konfirmasi Booking Servis Sekarang")');

    // Verify success modal with booking code
    await expect(page.locator("text=Booking Berhasil Dikonfirmasi!")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=BKG-")).toBeVisible();
  });
});
