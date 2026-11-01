# PANDUAN DEPLOYMENT BENGKELPRO: AKTIF 24 JAM & AKSES MULTI-DEVICE

Dokumen ini memandu Anda membuat aplikasi **BengkelPro — Smart Automotive Workshop Management System** aktif **24 jam non-stop** di internet dan dapat diakses dari smartphone (Android/iPhone), tablet, laptop, dan komputer lain dari mana saja.

---

## 🌟 Opsi 1: Cloud Deployment (Rekomendasi Utama — 100% Gratis & Permanen 24/7)

Dengan opsi ini:
- ✅ **Komputer/laptop Anda boleh dimatikan**; aplikasi tetap menyala 24 jam di cloud global.
- ✅ **Dapat diakses dari HP, tablet, dan PC siapa saja** menggunakan internet (4G/5G/Wi-Fi).
- ✅ **Otomatis HTTPS (SSL)** yang aman dan profesional (`https://bengkelpro-xxx.vercel.app`).
- ✅ **Gratis selamanya** menggunakan kombinasi **Vercel** (hosting serverless) + **Supabase** (database cloud).

---

### Tahap 1: Persiapan Database Cloud di Supabase (5 Menit)

1. Buka [https://supabase.com](https://supabase.com) dan klik **Start your project** (bisa login menggunakan akun GitHub atau Google).
2. Di dashboard Supabase, klik tombol **New Project**:
   - **Name**: `bengkelpro-database`
   - **Database Password**: Buat password yang kuat dan catat baik-baik.
   - **Region**: Pilih **Southeast Asia (Singapore)** (paling cepat dan latency rendah untuk pengguna di Indonesia).
   - **Pricing Plan**: Free (Gratis).
   - Klik **Create new project** dan tunggu ~1 menit hingga database selesai disiapkan.
3. Di panel sebelah kiri, klik menu **SQL Editor** (ikon `>_`), lalu klik tombol **New Query**.
4. Buka file skema database di project lokal Anda:  
   [`migrations/001_initial_schema.sql`](file:///C:/Users/HP%2015-ba/.gemini/antigravity/scratch/bengkelpro/migrations/001_initial_schema.sql).
5. Salin (**Ctrl+A**, lalu **Ctrl+C**) seluruh isi file SQL tersebut, tempelkan ke SQL Editor Supabase, lalu klik tombol **Run** (atau tekan **Ctrl+Enter**).
   - *Status akan menampilkan "Success" dan 34 tabel BengkelPro, RLS policies, trigger audit, serta data awal bengkel demo langsung aktif di cloud!*
6. Di panel sebelah kiri Supabase, klik **Project Settings** (ikon gerigi) -> **API**.
7. Salin 3 nilai penting berikut untuk digunakan di tahap berikutnya:
   - **Project URL** (misal: `https://xyzcompany.supabase.co`)
   - **Project API keys -> anon (public)**
   - **Project API keys -> service_role (secret)** *(Klik "Reveal" untuk menyalin)*

---

### Tahap 2: Push Kode ke Repositori GitHub Anda (3 Menit)

1. Buka [https://github.com/new](https://github.com/new) dan buat repositori baru:
   - **Repository name**: `bengkelpro`
   - Pilih **Private** atau **Public** (keduanya didukung gratis oleh Vercel).
   - Biarkan opsi *Initialize with README* kosong (jangan dicentang).
   - Klik **Create repository**.
2. Salin URL repositori Anda, misalnya: `https://github.com/<username-github>/bengkelpro.git`.
3. Buka terminal PowerShell di folder project:
   ```powershell
   cd "C:\Users\HP 15-ba\.gemini\antigravity\scratch\bengkelpro"
   git remote add origin https://github.com/<username-github>/bengkelpro.git
   git branch -M main
   git push -u origin main
   ```
   *(Ganti `<username-github>` dengan username GitHub Anda).*

---

### Tahap 3: Hubungkan dan Deploy ke Vercel (3 Menit)

1. Buka [https://vercel.com](https://vercel.com) dan masuk menggunakan akun GitHub Anda.
2. Di dashboard Vercel, klik tombol **Add New...** -> pilih **Project**.
3. Di daftar *Import Git Repository*, temukan repositori **bengkelpro** lalu klik tombol **Import**.
4. Di halaman konfigurasi project:
   - **Framework Preset**: Next.js (otomatis terdeteksi).
   - **Root Directory**: `./` (default).
5. Buka bagian **Environment Variables** (klik dropdown tanda panah), lalu tambahkan variabel-variabel berikut satu per satu:

| Key (Nama Variabel) | Value (Nilai) | Keterangan |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | `https://bengkelpro.vercel.app` | *Bisa disesuaikan setelah deploy jika nama domain berbeda* |
| `NEXT_PUBLIC_SUPABASE_URL` | *Salin dari Project URL Supabase* | Wajib untuk database cloud |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Salin dari anon key Supabase* | Wajib untuk autentikasi browser |
| `SUPABASE_SERVICE_ROLE_KEY` | *Salin dari service_role key Supabase* | Wajib untuk operasi backend admin |
| `GEMINI_API_KEY` | *Kunci API Gemini Anda (Opsional)* | Untuk fitur asisten AI diagnostik |

6. Klik tombol **Deploy**.
7. Tunggu proses build selama ~1-2 menit hingga muncul animasi konfeti dan tulisan **"Congratulations! You just deployed a new Project to Vercel."**
8. Anda akan mendapatkan URL publik resmi, contoh:  
   `https://bengkelpro-demo.vercel.app`

---

### Tahap 4: Mengakses BengkelPro dari Smartphone, Tablet & Device Lain

1. **Buka di Smartphone (Android / iPhone)**:
   - Buka browser di HP (Chrome / Safari), masukkan URL Vercel Anda: `https://bengkelpro-demo.vercel.app`.
   - Seluruh halaman sudah **100% responsif mobile**: formulir booking pelanggan, antarmuka mekanik, kasir invoice, dan laporan keuangan pemilik.
2. **Jadikan Aplikasi Home Screen (PWA Style)**:
   - **Di Android (Chrome)**: Klik menu titik tiga (⋮) di pojok kanan atas -> pilih **"Tambahkan ke Layar Utama" (Add to Home screen)**.
   - **Di iPhone (Safari)**: Klik tombol Share (ikon kotak panah ke atas) -> pilih **"Add to Home Screen"**.
   - Ikon BengkelPro akan muncul di layar utama smartphone seperti aplikasi Android/iOS native!

---

## ⚡ Opsi 2: Akses Langsung di HP via Wi-Fi Lokal (Tanpa Deploy Cloud)

Jika Anda ingin langsung menguji aplikasi di smartphone Anda **sekarang juga** selama terhubung ke jaringan Wi-Fi yang sama dengan laptop:

1. Pastikan laptop Anda menyala dan server BengkelPro sedang berjalan (`npm run dev` atau double-click `start.bat`).
2. Alamat IP Wi-Fi komputer Anda saat ini adalah:
   ```
   http://10.100.17.166:3000
   ```
3. Buka browser di smartphone Anda (pastikan HP terhubung ke Wi-Fi yang sama) dan ketik:
   - **Halaman Utama**: `http://10.100.17.166:3000`
   - **Portal Login Role**: `http://10.100.17.166:3000/login`
   - **Booking Online**: `http://10.100.17.166:3000/booking/sahabat-motor`

> 💡 **Catatan Firewall Windows**:  
> Jika browser HP mengalami *loading timeout*, izinkan Node.js di Windows Firewall:  
> Buka *Windows Security* -> *Firewall & network protection* -> *Allow an app through firewall* -> centang **Node.js JavaScript Runtime** untuk *Private* dan *Public*.

---

## 🌐 Opsi 3: Akses Publik via Cloudflare Tunnel / ngrok (Alternatif Sementara)

Jika Anda ingin membagikan tautan internet gratis kepada klien atau teman tanpa deploy ke Vercel:

1. Unduh **Cloudflare Tunnel (`cloudflared`)** atau **ngrok**.
2. Jalankan perintah di terminal:
   ```bash
   npx cloudflared tunnel --url http://localhost:3000
   ```
3. Cloudflare akan secara instan memberikan URL publik HTTPS gratis (contoh: `https://contoh-bengkel-pro.trycloudflare.com`) yang bisa dibuka dari seluruh dunia selama terminal Anda tetap aktif.

---

## 📊 Ringkasan Perbandingan

| Fitur / Karakteristik | Opsi 1: Vercel + Supabase (Direkomendasikan) | Opsi 2: Wi-Fi Lokal | Opsi 3: Tunnel (ngrok/Cloudflare) |
| :--- | :--- | :--- | :--- |
| **Status Aktif** | **24 Jam Non-Stop (Laptop Mati Tetap Aktif)** | Hanya saat laptop menyala | Hanya saat laptop menyala |
| **Akses Luar Rumah (4G/5G)** | ✅ Ya, di mana saja di seluruh dunia | ❌ Hanya dalam 1 Wi-Fi | ✅ Ya, di mana saja |
| **Kecepatan & Uptime** | ⚡ Super cepat (Serverless Edge Global) | Bergantung sinyal Wi-Fi | Bergantung koneksi laptop |
| **Biaya** | Gratis ($0) | Gratis ($0) | Gratis ($0) |
| **Alamat URL** | Domain HTTPS permanen rapi | IP angka lokal | URL acak sementara |
