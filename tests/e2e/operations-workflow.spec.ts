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

  test("End-to-End Mechanic Selesai -> Admin/Kasir Invoice & Payment -> Owner & Customer Sync", async ({
    page,
    request,
  }) => {
    // 0. Capture initial financial baseline before mechanic completion
    const beforeReportsRes = await request.get("/api/reports");
    expect(beforeReportsRes.status()).toBe(200);
    const { summary: financeBefore } = await beforeReportsRes.json();

    // 1. Mechanic Portal (/mechanic/dashboard): Complete WO-2611-0001
    await page.goto("/mechanic/dashboard");
    const activeCard = page.getByTestId("active-job-WO-2611-0001");
    await expect(activeCard).toBeVisible();

    const resultNote = "Ganti oli & kampas rem depan selesai, rem normal dan tarikan enteng.";
    await activeCard.locator("input[type='text']").fill(resultNote);
    await page.getByTestId("complete-wo-WO-2611-0001").click();

    // Notification banner + job moved out of active queue into service history
    await expect(page.getByRole("status")).toContainText("berhasil diselesaikan");
    await expect(page.getByTestId("active-job-WO-2611-0001")).toHaveCount(0);
    const completedCard = page.getByTestId("completed-job-WO-2611-0001");
    await expect(completedCard).toBeVisible();
    await expect(completedCard).toContainText("Selesai Dikerjakan");

    // Persistence check on reload
    await page.reload();
    await expect(page.getByTestId("active-job-WO-2611-0001")).toHaveCount(0);
    await expect(page.getByTestId("completed-job-WO-2611-0001")).toBeVisible();

    // Critical financial check: Mechanic completion MUST NOT record revenue before Kasir confirms payment
    const midReportsRes = await request.get("/api/reports");
    const { summary: financeMid } = await midReportsRes.json();
    expect(financeMid.totalRevenue).toBe(financeBefore.totalRevenue);
    expect(financeMid.totalTransactions).toBe(financeBefore.totalTransactions);
    expect(financeMid.pendingBillingCount).toBeGreaterThanOrEqual(1);

    // Mechanic history page shows completed work
    await page.goto("/mechanic/history");
    await expect(page.locator("text=WO-2611-0001")).toBeVisible();
    await expect(page.locator("text=Selesai Dikerjakan").first()).toBeVisible();

    // 2. Admin/Kasir Dashboard & Cashier Billing (/admin/dashboard -> /admin/invoices)
    await page.goto("/admin/dashboard");
    const adminQueueCard = page.getByTestId("cashier-queue-WO-2611-0001");
    await expect(adminQueueCard).toBeVisible();
    await expect(adminQueueCard).toContainText("Selesai Dikerjakan");

    await page.goto("/admin/invoices");
    const unbilledRow = page.getByTestId("unbilled-work-done-WO-2611-0001");
    await expect(unbilledRow).toBeVisible();
    await expect(unbilledRow).toContainText(resultNote);

    // Inspect Detail Pekerjaan modal
    await unbilledRow.getByRole("button", { name: "Detail Pekerjaan" }).click();
    await expect(page.locator("text=Pemeriksaan Akhir Kasir")).toBeVisible();
    await expect(page.locator(`text=${resultNote}`).first()).toBeVisible();
    await page.getByRole("button", { name: "Tutup" }).click();

    // Create invoice & auto-open payment modal
    await page.getByTestId("create-invoice-WO-2611-0001").click();
    await expect(page.locator("text=Catat Pembayaran Kasir")).toBeVisible();

    // QRIS validation: native required RRN + explicit merchant confirmation checkbox
    await page.getByRole("button", { name: "QRIS", exact: true }).click();
    const rrnInput = page.getByPlaceholder("Nomor Referensi / RRN QRIS *");
    await page.getByRole("button", { name: "Konfirmasi Pembayaran" }).click();
    await expect(rrnInput.evaluate((el) => (el as HTMLInputElement).validity.valueMissing)).resolves.toBe(
      true
    );

    await rrnInput.fill("RRN-E2E-20261112");
    await page.getByRole("button", { name: "Konfirmasi Pembayaran" }).click();
    await expect(
      page.locator("text=Centang konfirmasi bahwa dana QRIS benar-benar telah diterima di mutasi merchant.")
    ).toBeVisible();

    // Confirm merchant receipt & submit payment
    await page
      .getByLabel("Saya pastikan dana QRIS sudah terkonfirmasi masuk ke rekening/mutasi merchant.")
      .check();
    await page.getByRole("button", { name: "Konfirmasi Pembayaran" }).click();

    // Payment confirmation feedback + cleared unbilled queue
    await expect(page.locator("text=Lunas! Dashboard Owner & riwayat pelanggan otomatis diperbarui.")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("unbilled-work-done-WO-2611-0001")).toHaveCount(0);

    // 3. Owner Financial Sync (/owner/dashboard & /owner/reports)
    const afterReportsRes = await request.get("/api/reports");
    const { summary: financeAfter } = await afterReportsRes.json();
    expect(financeAfter.totalRevenue).toBeGreaterThan(financeBefore.totalRevenue);
    expect(financeAfter.totalTransactions).toBe(financeBefore.totalTransactions + 1);

    await page.goto("/owner/dashboard");
    await expect(page.locator("text=Riwayat Pembayaran Masuk Terkonfirmasi")).toBeVisible();
    await expect(page.locator("text=WO-2611-0001").first()).toBeVisible();

    await page.goto("/owner/reports");
    await expect(page.locator("text=Rincian Transaksi Pembayaran Masuk")).toBeVisible();
    await expect(page.locator("text=RRN-E2E-20261112")).toBeVisible();

    // 4. Customer Portal Sync (/customer/dashboard, /customer/invoices, /customer/service-history)
    await page.goto("/customer/dashboard");
    await expect(page.locator("text=Honda Vario 160")).toBeVisible();
    await expect(page.locator(`text=${resultNote}`)).toBeVisible();
    await expect(page.locator("text=Lunas").first()).toBeVisible();

    await page.goto("/customer/invoices");
    await expect(page.locator("text=Lunas").first()).toBeVisible();

    await page.goto("/customer/service-history");
    await expect(page.locator("text=WO-2611-0001")).toBeVisible();
    await expect(page.locator("text=Agus Prasetyo")).toBeVisible();
  });
});
