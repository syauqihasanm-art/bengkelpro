# BengkelPro — Environment Variables Reference

Dokumen ini menjelaskan variabel lingkungan yang digunakan di BengkelPro, peruntukannya, serta petunjuk konfigurasinya.

---

## 1. Variabel Aplikasi Inti (Wajib)

| Variabel | Deskripsi | Nilai Default / Contoh |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | URL basis publik aplikasi BengkelPro | `http://localhost:3000` (Dev) / `https://bengkelpro.id` (Prod) |
| `PORT` | Port jaringan yang digunakan oleh server Next.js | `3000` (Diatur otomatis oleh Railway di production) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL endpoint API Supabase Managed Database | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Kunci anon publik Supabase (Aman untuk browser) | `eyJh...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci admin Supabase (Wajib dirahasiakan, hanya di server) | `eyJh...` |

---

## 2. Variabel Integrasi Tambahan (Opsional)

| Variabel | Kategori | Deskripsi |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | AI Assistant | Kunci API Google Gemini untuk analisis keluhan kendaraan dinamis. Jika kosong, sistem otomatis beralih ke basis pengetahuan internal otomotif secara graceful. |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`| Payment Gateway | Kunci klien Midtrans untuk render UI Snap / QRIS. |
| `MIDTRANS_SERVER_KEY` | Payment Gateway | Kunci otentikasi server-to-server untuk verifikasi webhook pembayaran. |
| `MIDTRANS_IS_PRODUCTION` | Payment Gateway | `false` (Sandbox uji coba) / `true` (Transaksi produksi nyata). |
| `EMAIL_PROVIDER_API_KEY` | Notifikasi | Kunci API Resend / SendGrid untuk notifikasi faktur email. |
| `WHATSAPP_ACCESS_TOKEN` | Notifikasi | Token WhatsApp Cloud API untuk pengingat servis otomatis. |
| `SENTRY_DSN` | Monitoring | URL DSN Sentry untuk tracking exception runtime di level produksi. |

---

## 3. Petunjuk Konfigurasi di Railway:
1. Buka project Anda di [Railway Dashboard](https://railway.com).
2. Pilih service **BengkelPro**.
3. Buka tab **Variables**.
4. Tambahkan pasangan key-value sesuai tabel di atas.
5. Railway akan otomatis me-restart service dengan variabel baru secara aman tanpa downtime (Rolling deployment).
