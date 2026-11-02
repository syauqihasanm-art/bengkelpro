# Panduan Deployment Produksi 24 Jam BengkelPro (GitHub & Railway)

Dokumen ini menyediakan panduan langkah-demi-langkah bagi Workshop Owner atau DevOps Engineer untuk menghubungkan BengkelPro ke GitHub dan menjalankan aplikasi secara online 24 jam non-stop menggunakan platform cloud Railway.

---

## 1. Spesifikasi Produksi Aplikasi

| Komponen | Spesifikasi / Konfigurasi |
| :--- | :--- |
| **Framework** | Next.js 14.2.35 (App Router, Server & Client Components) |
| **Runtime** | Node.js v20.x / v26.x, React 18.3.1 |
| **Styling & UI** | Tailwind CSS 3.4.14, Lucide React, Recharts |
| **Build Command** | `npm run build` |
| **Start Command** | `npm run start` (eksekusi `next start -H 0.0.0.0`) |
| **Healthcheck Endpoint** | `/api/health` (HTTP 200) |
| **Database** | PostgreSQL (Supabase Cloud) + Singleton In-Memory Engine |
| **Restart Policy** | `ALWAYS` (Railway spec di `railway.toml`) |
| **Sleep Policy** | Disabled (`sleepApplication = false`) |

---

## 2. Langkah 1: Hubungkan ke GitHub

Repositori Git lokal BengkelPro sudah diinisialisasi dan seluruh file telah di-commit secara bersih pada branch `main`. Tidak ada token, password, atau file `.env` rahasia yang ter-commit.

### Cara Menghubungkan ke GitHub:

1. **Buka Browser & Login ke GitHub**:
   Kunjungi [github.com/new](https://github.com/new).

2. **Buat Repositori Baru**:
   - Berikan nama repositori: `bengkelpro`
   - Pilih visibilitas: **Private** (atau Public sesuai preferensi)
   - Jangan centang "Add a README file" atau .gitignore (karena repo lokal sudah lengkap)
   - Klik **Create repository**.

3. **Jalankan Perintah Push di Terminal Komputer Anda**:
   Buka terminal PowerShell di folder BengkelPro (`C:\Users\HP 15-ba\.gemini\antigravity\scratch\bengkelpro`) dan jalankan:

   ```powershell
   git remote add origin https://github.com/<USERNAME-ANDA>/bengkelpro.git
   git branch -M main
   git push -u origin main
   ```
   *(Ganti `<USERNAME-ANDA>` dengan username GitHub Anda).*

---

## 3. Langkah 2: Deploy ke Railway (24 Jam Non-Stop)

Railway adalah platform hosting cloud yang mendukung proses Next.js secara continuous (tidak mati/tidak tertidur seperti tier gratisan lama), didukung oleh konfigurasi `railway.toml` dan `Dockerfile` yang telah tersedia di repo BengkelPro.

### Cara Setup di Railway:

1. **Login ke Railway**:
   Kunjungi [railway.com](https://railway.com/) dan login menggunakan akun GitHub Anda.

2. **Buat Proyek Baru**:
   - Klik tombol **+ New Project**.
   - Pilih **Deploy from GitHub repo**.
   - Pilih repositori `bengkelpro` yang baru saja Anda push.

3. **Konfigurasi Environment Variables di Railway**:
   Di dashboard project Railway, buka menu **Variables** dan tambahkan variabel berikut:

   | Nama Variabel | Nilai / Keterangan |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` *(atau biarkan Railway menginjeksikan otomatis)* |
   | `NEXT_PUBLIC_APP_URL` | URL domain publik Railway Anda (contoh: `https://bengkelpro-production.up.railway.app`) |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase Project Anda (dari menu Settings > API) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Key Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key Supabase (rahasia server-side) |
   | `GEMINI_API_KEY` | *(Opsional)* API Key Google AI Studio untuk asisten diagnosa |
   | `MIDTRANS_SERVER_KEY` | *(Opsional)* Server key payment gateway |

4. **Konfigurasi Domain Publik HTTPS**:
   - Di tab **Settings** layanan Railway Anda, gulir ke bagian **Networking**.
   - Klik **Generate Domain** (Railway akan memberikan domain instan gratis berakhiran `.up.railway.app` dengan sertifikat SSL/HTTPS otomatis).
   - Atau klik **Custom Domain** jika Anda memiliki domain bengkel sendiri (contoh: `app.bengkelanda.com`).

5. **Deploy & Pemantauan**:
   - Railway akan otomatis menjalankan `npm run build` dan `npm run start`.
   - Healthcheck Railway akan otomatis memanggil `/api/health` setiap beberapa detik untuk memastikan sistem selalu aktif dan responsif.
   - Jika terjadi kendala sistem atau memory peak, restart policy `ALWAYS` akan otomatis me-restart aplikasi dalam hitungan detik.

---

## 4. Langkah 3: Setup Database Supabase Cloud (24 Jam)

Jika Anda ingin menghubungkan database PostgreSQL Supabase secara permanen:

1. Buka [database.new](https://database.new) untuk membuat proyek Supabase gratis.
2. Buka menu **SQL Editor** di dashboard Supabase.
3. Buka file [`migrations/001_initial_schema.sql`](file:///C:/Users/HP%2015-ba/.gemini/antigravity/scratch/bengkelpro/migrations/001_initial_schema.sql) dan salin isinya, lalu klik **Run**.
4. Buka file [`migrations/002_storage_and_indexes.sql`](file:///C:/Users/HP%2015-ba/.gemini/antigravity/scratch/bengkelpro/migrations/002_storage_and_indexes.sql) dan salin isinya, lalu klik **Run**.
5. Salin `Project URL`, `anon public key`, dan `service_role key` dari menu **Settings > API**, lalu masukkan ke dalam Environment Variables di Railway.

---

## 5. Ringkasan File Konfigurasi Produksi

- [`railway.toml`](file:///C:/Users/HP%2015-ba/.gemini/antigravity/scratch/bengkelpro/railway.toml): Konfigurasi Nixpacks, start command, healthcheck path, and non-sleeping continuous runtime.
- [`Dockerfile`](file:///C:/Users/HP%2015-ba/.gemini/antigravity/scratch/bengkelpro/Dockerfile): Multi-stage container production Docker image.
- [`app/api/health/route.ts`](file:///C:/Users/HP%2015-ba/.gemini/antigravity/scratch/bengkelpro/app/api/health/route.ts): Endpoint pemantauan uptime dan health status.
- [`docs/BACKUP_AND_DISASTER_RECOVERY.md`](file:///C:/Users/HP%2015-ba/.gemini/antigravity/scratch/bengkelpro/docs/BACKUP_AND_DISASTER_RECOVERY.md): Rencana pencadangan, RPO/RTO, dan disaster recovery.
