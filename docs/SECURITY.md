# BengkelPro — Security Architecture & Compliance

## 1. Multi-Tenant Data Isolation (PostgreSQL RLS)
BengkelPro menerapkan prinsip **Defense in Depth**:
1. **Application Layer**: Setiap query service di `lib/db.ts` dan API route secara eksplisit memfilter `workshop_id`.
2. **Database Engine Layer**: PostgreSQL Row Level Security (RLS) secara independen mencegah akses data silang antar-bengkel di tingkat kernel database, bahkan jika terjadi celah di layer aplikasi.

---

## 2. Server-Side Secret Protection
Kunci rahasia berikut **TIDAK PERNAH** diekspos ke browser atau bundling klien:
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `MIDTRANS_SERVER_KEY`
- Database credentials & JWT signing secrets

Semua komunikasi pihak ketiga (Midtrans webhook, Gemini API, Supabase Admin) dieksekusi secara ketat melalui Next.js API Routes / Server Actions di lingkungan backend.

---

## 3. Webhook & Idempotency Safety
- **Idempotency Key**: Setiap transaksi pembayaran di `/api/invoices` mencatat `idempotency_key` unik untuk mencegah pemrosesan ganda akibat network retry atau duplikasi callback payment gateway.
- **Validasi Nilai Transaksi**: Nilai pembayaran dan total tagihan selalu dihitung ulang di server (`calculateTotals`) dan tidak pernah mempercayai angka yang dikirimkan oleh browser klien.

---

## 4. Kepatuhan Regulasi Perlindungan Data Pribadi (UU PDP Indonesia)
- Mengikuti kaidah UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (PDP).
- Data nomor telepon, alamat, dan nomor polisi kendaraan dienkripsi dalam transit (HTTPS TLS 1.3) dan rest.
- Pelanggan berhak melihat dan memperbarui informasi kendaraan pribadi melalui Portal Pelanggan (/customer/profile).
