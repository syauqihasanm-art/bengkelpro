# BengkelPro — API Reference & Integration Guide

Seluruh endpoint RESTful mengembalikan format JSON standar dan status HTTP yang sesuai.

---

## 1. Health & Monitoring Endpoint
- **URL**: `GET /api/health`
- **Tujuan**: Endpoint pemantauan uptime untuk Railway, UptimeRobot, dan load balancer.
- **Respon Sukses (200 OK)**:
```json
{
  "status": "ok",
  "timestamp": "2026-11-01T11:00:00.000Z",
  "service": "BengkelPro Workshop Management System",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 1420,
  "checks": {
    "database": "healthy",
    "api": "healthy"
  },
  "responseTimeMs": 4
}
```

---

## 2. Pendaftaran Bengkel Baru
- **URL**: `POST /api/auth/register-workshop`
- **Request Body**:
```json
{
  "name": "Bengkel Maju Motor",
  "ownerName": "Budi Santoso",
  "email": "owner@majumotor.id",
  "phone": "081234567890",
  "workshopType": "motor",
  "address": "Jl. Raya Fatmawati No. 10",
  "city": "Jakarta Selatan",
  "province": "DKI Jakarta",
  "password": "secretpassword"
}
```

---

## 3. Booking Servis Publik
- **URL**: `POST /api/bookings/public`
- **Fitur**: Pencegahan double-booking dan pembatasan kuota kapasitas harian.

---

## 4. Surat Perintah Kerja (SPK) & Potong Stok
- **URL**: `POST /api/work-orders` (Buat SPK)
- **URL**: `PATCH /api/work-orders` (Update status SPK)
  - Transisi ke `in_progress` dengan status persetujuan `approved` otomatis memicu pengurangan stok part yang aman dan mencatat mutasi `stock_movements`.
  - Transisi ke `completed` otomatis menerbitkan faktur tagihan dan riwayat servis.

---

## 5. Kasir & Pembayaran Faktur
- **URL**: `POST /api/invoices`
- **Fitur**: Pencatatan pembayaran tunai, transfer, dan QRIS dengan dukungan idempotency key untuk mencegah double-payment.
