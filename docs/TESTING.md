# BengkelPro — Automated Testing & Quality Assurance Report

## 1. Test Suite Architecture
BengkelPro menerapkan piramida pengujian otomatis menggunakan **Vitest** dan **TypeScript**:
- **Static Analysis & Type Checking**: `tsc --noEmit`
- **Unit Testing**:
  - `tests/unit/financial.test.ts` (Perhitungan subtotal, diskon, PPN, format Rupiah)
  - `tests/unit/inventory.test.ts` (Penambahan stok, penyesuaian mutasi, pencegahan stok negatif)
  - `tests/unit/work-order.test.ts` (Siklus hidup SPK, persetujuan pelanggan, pemotongan stok otomatis)
  - `tests/unit/booking.test.ts` (Pencegahan double-booking kendaraan pada tanggal sama)
- **Integration Testing**:
  - `tests/integration/full-service-cycle.test.ts` (Alur utuh dari pembuatan customer, kendaraan, booking, konfirmasi, penerbitan SPK, pemotongan stok, faktur kasir, pembayaran QRIS, hingga buku riwayat servis)

---

## 2. Test Execution Command
Untuk menjalankan pengujian otomatis:
```bash
npm run test
```

Hasil verifikasi:
```text
 ✓ tests/unit/work-order.test.ts (2 tests)
 ✓ tests/unit/inventory.test.ts (3 tests)
 ✓ tests/integration/full-service-cycle.test.ts (1 test)
 ✓ tests/unit/booking.test.ts (1 test)
 ✓ tests/unit/financial.test.ts (3 tests)

 Test Files  5 passed (5)
      Tests  10 passed (10)
```

100% test suite berhasil lulus tanpa kegagalan regresi.
