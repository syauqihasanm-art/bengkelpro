import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";
import { dispatchApiRequest } from "@/lib/api/router";

describe("Mechanic Completion -> Cashier Billing -> Owner Financial Integration", () => {
  const workshopId = "11111111-1111-4111-8111-111111111111";
  const agusMechanicId = "44444444-4444-4444-8444-444444444444";
  const dediMechanicId = "m2222222-2222-4222-8222-222222222222";
  const customerId = "55555555-5555-4555-8555-555555555555";
  const vehicleId = "66666666-6666-4666-8666-666666666666";

  it("enforces mechanic assignment, transitions through work_done -> awaiting_payment -> completed, and prevents premature or duplicate revenue/stock deduction", async () => {
    const financeBefore = db.getFinancialSummary(workshopId);
    const agusBefore = db.getMechanics(workshopId).find((m) => m.id === agusMechanicId)!;
    expect(agusBefore).toBeDefined();
    const initialAgusActive = agusBefore.activeJobsCount ?? 0;
    const initialAgusCompleted = agusBefore.completedJobsCount ?? 0;

    const part = db.getProducts(workshopId)[0];
    expect(part).toBeDefined();
    const initialStock = part.stockQuantity;

    // 1. Admin/Kasir creates SPK assigned exclusively to Agus
    const createWoRes = await dispatchApiRequest(
      new Request("http://localhost/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId,
          customerId,
          vehicleId,
          odometerIn: 18900,
          customerComplaint: "Rem depan bunyi & servis berkala",
          assignedMechanicIds: [agusMechanicId],
          items: [
            {
              itemType: "service",
              name: "Jasa Servis Berkala + Cek Rem",
              quantity: 1,
              unitPrice: 95000,
              isApproved: true,
            },
            {
              itemType: "part",
              referenceId: part.id,
              name: part.name,
              quantity: 1,
              unitPrice: part.sellingPrice,
              isApproved: true,
            },
          ],
        }),
      }),
      ["work-orders"]
    );
    expect(createWoRes.status).toBe(201);
    const { workOrder: createdWO } = await createWoRes.json();
    expect(createdWO.status).toBe("waiting");
    expect(createdWO.assignedMechanics.map((m: any) => m.id)).toContain(agusMechanicId);
    expect(db.getProductById(workshopId, part.id)!.stockQuantity).toBe(initialStock);

    // Agus activeJobsCount increased by 1
    const agusAfterCreate = db.getMechanics(workshopId).find((m) => m.id === agusMechanicId)!;
    expect(agusAfterCreate.activeJobsCount).toBe(initialAgusActive + 1);

    // 2. Reject missing mechanicId or wrong/unassigned mechanic (Dedi)
    const missingMechRes = await dispatchApiRequest(
      new Request("http://localhost/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: createdWO.id,
          workshopId,
          action: "mechanic_complete",
        }),
      }),
      ["work-orders"]
    );
    expect(missingMechRes.status).toBe(400);

    const wrongMechRes = await dispatchApiRequest(
      new Request("http://localhost/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: createdWO.id,
          workshopId,
          action: "mechanic_complete",
          mechanicId: dediMechanicId,
          workResult: "Mencoba klaim pekerjaan mekanik lain",
        }),
      }),
      ["work-orders"]
    );
    expect(wrongMechRes.status).toBe(400);
    expect(db.getWorkOrderById(workshopId, createdWO.id)!.status).toBe("waiting");

    // 3. Assigned mechanic Agus clicks "Selesai" -> work_done ("Selesai Dikerjakan")
    const completeRes = await dispatchApiRequest(
      new Request("http://localhost/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: createdWO.id,
          workshopId,
          action: "mechanic_complete",
          mechanicId: agusMechanicId,
          inspectionFindings: "Kampas rem aus 80%, oli perlu ganti",
          workResult: "Penggantian part selesai dan uji jalan normal",
        }),
      }),
      ["work-orders"]
    );
    expect(completeRes.status).toBe(200);
    const { workOrder: doneWO } = await completeRes.json();
    expect(doneWO.status).toBe("work_done");
    expect(doneWO.completedByMechanicId).toBe(agusMechanicId);
    expect(doneWO.completedByMechanicName).toBe("Agus Prasetyo");
    expect(doneWO.mechanicCompletedAt).toBeDefined();
    expect(doneWO.workResult).toBe("Penggantian part selesai dan uji jalan normal");
    const partItems = (doneWO.items || []).filter((it: any) => it.itemType === "part");
    expect(partItems.length).toBeGreaterThan(0);
    expect(partItems.every((it: any) => it.isPartsDeducted === true)).toBe(true);

    // Stock deducted exactly once; second complete rejected
    expect(db.getProductById(workshopId, part.id)!.stockQuantity).toBe(initialStock - 1);
    const duplicateCompleteRes = await dispatchApiRequest(
      new Request("http://localhost/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: createdWO.id,
          workshopId,
          action: "mechanic_complete",
          mechanicId: agusMechanicId,
        }),
      }),
      ["work-orders"]
    );
    expect(duplicateCompleteRes.status).toBe(400);

    // Mechanic counters updated accurately
    const agusAfterDone = db.getMechanics(workshopId).find((m) => m.id === agusMechanicId)!;
    expect(agusAfterDone.activeJobsCount).toBe(initialAgusActive);
    expect(agusAfterDone.completedJobsCount).toBe(initialAgusCompleted + 1);

    // CRITICAL: No invoice & NO revenue added yet on mechanic completion (COGS recorded once for installed part)
    const financeAtWorkDone = db.getFinancialSummary(workshopId);
    expect(financeAtWorkDone.totalRevenue).toBe(financeBefore.totalRevenue);
    expect(financeAtWorkDone.serviceRevenue).toBe(financeBefore.serviceRevenue);
    expect(financeAtWorkDone.partsRevenue).toBe(financeBefore.partsRevenue);
    expect(financeAtWorkDone.cogs).toBe(financeBefore.cogs + part.purchasePrice);
    expect(financeAtWorkDone.totalTransactions).toBe(financeBefore.totalTransactions);
    expect(financeAtWorkDone.pendingBillingCount).toBe(financeBefore.pendingBillingCount + 1);

    // Service history exists and shows work_done with no invoice yet
    const historyRes1 = await dispatchApiRequest(
      new Request(`http://localhost/api/service-history?workshopId=${workshopId}&customerId=${customerId}`),
      ["service-history"]
    );
    const historyData1 = await historyRes1.json();
    const record1 = historyData1.histories.find((h: any) => h.workOrderId === createdWO.id);
    expect(record1).toBeDefined();
    expect(record1.workOrderStatus).toBe("work_done");
    expect(record1.invoiceStatus).toBeUndefined();

    // 4. Admin/Kasir creates Invoice -> status becomes awaiting_payment ("Menunggu Pembayaran")
    const createInvRes = await dispatchApiRequest(
      new Request("http://localhost/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId,
          action: "create",
          workOrderId: createdWO.id,
        }),
      }),
      ["invoices"]
    );
    expect(createInvRes.status).toBe(201);
    const { invoice, workOrder: billedWO } = await createInvRes.json();
    expect(invoice.status).toBe("unpaid");
    expect(invoice.totalAmount).toBe(95000 + part.sellingPrice);
    expect(billedWO.status).toBe("awaiting_payment");

    // Still no duplicate stock deduction & still no revenue before payment confirmation
    expect(db.getProductById(workshopId, part.id)!.stockQuantity).toBe(initialStock - 1);
    const financeAtBilling = db.getFinancialSummary(workshopId);
    expect(financeAtBilling.totalRevenue).toBe(financeBefore.totalRevenue);
    expect(financeAtBilling.awaitingPaymentCount).toBe(financeBefore.awaitingPaymentCount + 1);

    // 5. QRIS without external reference / confirmation MUST be rejected (no fake payment)
    const fakeQrisRes = await dispatchApiRequest(
      new Request("http://localhost/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId,
          invoiceId: invoice.id,
          amount: invoice.totalAmount,
          paymentMethod: "qris",
        }),
      }),
      ["invoices"]
    );
    expect(fakeQrisRes.status).toBe(400);

    const unconfirmedQrisRes = await dispatchApiRequest(
      new Request("http://localhost/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId,
          invoiceId: invoice.id,
          amount: invoice.totalAmount,
          paymentMethod: "qris",
          externalReference: "RRN-000123",
          qrisConfirmed: false,
        }),
      }),
      ["invoices"]
    );
    expect(unconfirmedQrisRes.status).toBe(400);

    // 6. Confirm verified QRIS payment -> Invoice Paid ("Lunas"), SPK Completed, Owner Revenue Updated
    const idempotencyKey = `pay-qris-${createdWO.id}`;
    const confirmPayRes = await dispatchApiRequest(
      new Request("http://localhost/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId,
          invoiceId: invoice.id,
          amount: invoice.totalAmount,
          paymentMethod: "qris",
          externalReference: "RRN-20261112-8899",
          qrisConfirmed: true,
          verifiedBy: "Kasir Utama",
          idempotencyKey,
        }),
      }),
      ["invoices"]
    );
    expect(confirmPayRes.status).toBe(201);
    const payData = await confirmPayRes.json();
    expect(payData.invoice.status).toBe("paid");
    expect(payData.invoice.paidAmount).toBe(invoice.totalAmount);
    expect(payData.workOrder.status).toBe("completed");
    expect(payData.workOrder.paidAt).toBeDefined();

    // Replaying same idempotencyKey does NOT double count
    const replayRes = await dispatchApiRequest(
      new Request("http://localhost/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId,
          invoiceId: invoice.id,
          amount: invoice.totalAmount,
          paymentMethod: "qris",
          externalReference: "RRN-20261112-8899",
          qrisConfirmed: true,
          idempotencyKey,
        }),
      }),
      ["invoices"]
    );
    expect(replayRes.status).toBe(201);

    // Financial reconciliation updated cleanly once
    const financeAfterPay = db.getFinancialSummary(workshopId);
    const expectedProfitDelta = invoice.totalAmount - part.purchasePrice;
    expect(financeAfterPay.totalRevenue).toBe(financeBefore.totalRevenue + invoice.totalAmount);
    expect(financeAfterPay.grossProfit).toBe(financeBefore.grossProfit + expectedProfitDelta);
    expect(financeAfterPay.netProfit).toBe(financeBefore.netProfit + expectedProfitDelta);
    expect(financeAfterPay.totalTransactions).toBe(financeBefore.totalTransactions + 1);
    expect(financeAfterPay.paidInvoicesCount).toBe(financeBefore.paidInvoicesCount + 1);
    expect(financeAfterPay.recentTransactions.some((tx) => tx.invoiceNumber === invoice.invoiceNumber)).toBe(
      true
    );

    // Service history reflects Lunas / completed
    const historyRes2 = await dispatchApiRequest(
      new Request(`http://localhost/api/service-history?workshopId=${workshopId}&customerId=${customerId}`),
      ["service-history"]
    );
    const historyData2 = await historyRes2.json();
    const record2 = historyData2.histories.find((h: any) => h.workOrderId === createdWO.id);
    expect(record2.workOrderStatus).toBe("completed");
    expect(record2.invoiceStatus).toBe("paid");
  });
});
