# BengkelPro — Smart Automotive Workshop Management System

> **"Kelola Bengkel Lebih Mudah, Cepat, dan Profesional."**

BengkelPro adalah platform SaaS manajemen operasional bengkel otomotif terintegrasi nomor satu di Indonesia. Dirancang khusus untuk bengkel sepeda motor, mobil, dan servis umum independen, menghubungkan pemilik bengkel, kasir, mekanik, dan pelanggan dalam satu ekosistem cerdas.

---

## 🚀 Fitur Unggulan Sistem

- **Sistem Multi-Tenant Terisolasi**: PostgreSQL Row Level Security (RLS) menjamin pemisahan data 100% aman antar-bengkel.
- **5 Peran Pengguna (RBAC)**: Super Admin, Workshop Owner, Workshop Admin (Kasir), Mechanic, dan Customer.
- **Surat Perintah Kerja (SPK) Digital**: Workflow terstruktur dari inspeksi awal, estimasi biaya, persetujuan pelanggan, pengerjaan, hingga faktur kasir.
- **Inventaris Stok Transaksional**: Pengurangan stok otomatis yang aman dari manipulasi. Setiap part tercatat dalam audit mutasi stok (*stock movement*).
- **Booking Online & Kuota Antrean**: Halaman booking publik mandiri per-bengkel (`/booking/[slug]`) dengan pembatasan kapasitas harian.
- **Kasir & Faktur Pajak Otomatis**: Dukungan pembayaran Tunai, Transfer Bank, dan QRIS dengan kalkulasi subtotal, diskon, dan pajak di server.
- **Laporan Laba/Rugi Real-Time**: Rekonsiliasi omzet riil, HPP suku cadang (COGS), beban operasional kas, dan laba bersih.
- **Asisten AI Otomotif Pintar**: Didukung Google Gemini API untuk diagnosa keluhan suara kendaraan, checklist inspeksi, dan ringkasan pekerjaan.
- **Buku Servis Digital & Pengingat Servis**: Rekam jejak permanen riwayat perbaikan motor/mobil dan rekomendasi kilometer berikutnya.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript (Strict Mode), Tailwind CSS, Lucide Icons.
- **Backend**: Next.js Server Actions & API Routes, Zod Schema Validation, Centralized Error Boundary.
- **Database**: Supabase Managed PostgreSQL (34 Relational Tables, RLS Policies, Indexes & Constraints).
- **Quality Assurance**: Vitest (Unit & Integration Testing), TypeScript Type Checking.
- **Production Hosting**: Railway Production Plan, Standalone Node.js Container, Healthcheck Endpoint (`/api/health`).

---

## 📦 Instalasi & Menjalankan Lokal

### 1. Prasyarat Sistem
- Node.js versi 18.x / 20.x / 26.x
- npm versi 9+

### 2. Kloning & Pemasangan Dependensi
```bash
git clone <repository-url>
cd bengkelpro
npm install
```

### 3. Konfigurasi Variabel Lingkungan
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan kunci `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dan `GEMINI_API_KEY` (opsional).

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pengujian Otomatis (Testing)

Jalankan seluruh test suite unit & integrasi:
```bash
npm run test
```

Jalankan pemeriksaan type checking TypeScript:
```bash
npm run typecheck
```

---

## 🚢 Production Build & Deployment

Untuk membuat build produksi mandiri:
```bash
npm run build
npm start
```

Aplikasi siap di-deploy langsung ke Railway dengan konfigurasi:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Healthcheck Path**: `/api/health`
- **Restart Policy**: `ALWAYS`

---

## 📄 Dokumentasi Terperinci

1. [Product Requirements Document (PRD)](./docs/PRD.md)
2. [System Architecture & Design](./docs/ARCHITECTURE.md)
3. [Database Schema (34 Relational Tables)](./docs/DATABASE.md)
4. [User Roles & Permissions Matrix](./docs/USER_ROLES.md)
5. [API Reference & Health Monitoring](./docs/API.md)
6. [Security & PDP Compliance](./docs/SECURITY.md)
7. [Automated Testing Report](./docs/TESTING.md)
8. [Production Deployment Guide](./docs/DEPLOYMENT.md)
9. [Environment Variables Guide](./docs/ENVIRONMENT_VARIABLES.md)
10. [Backup & Disaster Recovery Procedures](./docs/BACKUP_AND_RECOVERY.md)
11. [Panduan Pengguna (User Guide)](./docs/USER_GUIDE.md)

---

## 📝 Lisensi & Hak Cipta
© 2026 BengkelPro Indonesia. Seluruh hak cipta dilindungi undang-undang.
