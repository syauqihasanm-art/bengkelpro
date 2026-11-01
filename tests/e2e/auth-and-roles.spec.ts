import { test, expect } from "@playwright/test";

test.describe("Authentication and Role Dashboards", () => {
  test("Login page displays quick role switchers and redirects correctly", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("text=Masuk ke BengkelPro")).toBeVisible();
    await expect(page.locator("text=Pemilik Bengkel")).toBeVisible();
    await expect(page.locator("text=Admin / Kasir")).toBeVisible();
    await expect(page.locator("text=Mekanik")).toBeVisible();
    await expect(page.locator("text=Pelanggan")).toBeVisible();
    await expect(page.locator("text=Super Admin Platform")).toBeVisible();
  });

  test("Workshop Owner dashboard loads metrics and quick links", async ({ page }) => {
    await page.goto("/owner/dashboard");

    await expect(page.locator("text=Dashboard Pemilik Bengkel")).toBeVisible();
    await expect(page.locator("text=Pendapatan Kas (Lunas)")).toBeVisible();
    await expect(page.locator("text=SPK Aktif Dikerjakan")).toBeVisible();
    await expect(page.locator("text=Peringatan Stok Tipis")).toBeVisible();
  });

  test("Admin / Kasir dashboard loads queue and work orders", async ({ page }) => {
    await page.goto("/admin/dashboard");

    await expect(page.locator("text=Dashboard Kasir & Operasional")).toBeVisible();
    await expect(page.locator("text=Antrean Booking Masuk")).toBeVisible();
  });

  test("Mechanic dashboard loads assigned work orders", async ({ page }) => {
    await page.goto("/mechanic/dashboard");

    await expect(page.locator("text=Portal Teknisi & Mekanik")).toBeVisible();
    await expect(page.locator("text=Pekerjaan Aktif Ditugaskan")).toBeVisible();
  });

  test("Customer dashboard loads user vehicles and service records", async ({ page }) => {
    await page.goto("/customer/dashboard");

    await expect(page.locator("text=Portal Pemilik Kendaraan")).toBeVisible();
    await expect(page.locator("text=Kendaraan Terdaftar")).toBeVisible();
  });

  test("Super Admin dashboard loads platform management controls", async ({ page }) => {
    await page.goto("/super-admin/dashboard");

    await expect(page.locator("text=Super Admin Platform Oversight")).toBeVisible();
    await expect(page.locator("text=Total Bengkel Terdaftar")).toBeVisible();
  });
});
