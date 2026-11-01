# Panduan Menjalankan BengkelPro — Smart Automotive Workshop Management System

Dokumentasi ini menjelaskan langkah-langkah praktis untuk membuka, mengonfigurasi, dan menjalankan aplikasi **BengkelPro** di sistem operasi Windows.

---

## 1. Cara Membuka Project

1. Buka File Explorer di Windows, lalu navigasikan ke folder proyek:
   ```
   C:\Users\HP 15-ba\.gemini\antigravity\scratch\bengkelpro
   ```
2. Atau buka terminal **PowerShell** dan masuk ke direktori proyek:
   ```powershell
   cd "C:\Users\HP 15-ba\.gemini\antigravity\scratch\bengkelpro"
   ```

---

## 2. Cara Instalasi Dependencies

Jika direktori `node_modules` belum ada atau dependensi baru ditambahkan:
```powershell
# Menggunakan npm (sesuai package-lock.json)
npm install
```

---

## 3. Cara Konfigurasi Environment

Salin file `.env.example` menjadi `.env.local` jika belum dibuat:
```powershell
Copy-Item .env.example .env.local
```

Variabel yang tersedia di `.env.local`:
- `NEXT_PUBLIC_APP_URL`: URL aplikasi lokal (default: `http://localhost:3000`).
- `PORT`: Port server lokal (default: `3000`).
- `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase Cloud (opsional untuk mode live DB).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Kunci anonim Supabase (opsional).
- `SUPABASE_SERVICE_ROLE_KEY`: Kunci server Supabase (opsional, server-only).
- `GEMINI_API_KEY`: API Key Google Gemini untuk asisten AI diagnosa otomotif (opsional).
- `MIDTRANS_SERVER_KEY`: Kunci server pembayaran Midtrans QRIS/VA (opsional).

*Catatan: Jika variabel eksternal dikosongkan, aplikasi secara otomatis berjalan menggunakan basis data internal dan basis pengetahuan otomotif standar tanpa error.*

---

## 4. Cara Menjalankan Database

BengkelPro dirancang dengan arsitektur fleksibel:
1. **Mode Lokal Standar (Tanpa Setup Tambahan)**:
   - Aplikasi menggunakan lapisan data transaksional otomatis (`lib/db.ts` dan `lib/store/index.ts`) yang telah memuat data benih (*seed data*) lengkap untuk 5 peran dan seluruh modul operasional.
2. **Mode Supabase Cloud (Produksi)**:
   - Buat proyek baru di [Supabase Dashboard](https://supabase.com).
   - Masuk ke menu **SQL Editor**.
   - Salin dan jalankan seluruh isi file `migrations/001_initial_schema.sql` (34 tabel + RLS policies).
   - Salin URL dan API keys ke file `.env.local`.

---

## 5. Cara Menjalankan Aplikasi

### Opsi A — Menjalankan Server Pengembangan (Development):
```powershell
npm run dev
```
Aplikasi akan aktif di: **`http://localhost:3000`**

### Opsi B — Menjalankan Menggunakan Skrip Satu Klik (Windows):
Cukup klik dua kali file:
```
start.bat
```
Skrip ini akan memeriksa Node.js, dependencies, file `.env.local`, dan menjalankan server secara otomatis.

---

## 6. Cara Menghentikan Server

1. Jika server berjalan di jendela terminal, tekan kombinasi tombol:
   ```
   Ctrl + C
   ```
   Lalu ketik `Y` dan tekan Enter.
2. Atau jalankan skrip penghenti otomatis:
   ```
   stop.bat
   ```
   Skrip ini akan mencari proses yang mendengarkan port 3000 dan menghentikannya secara aman.

---

## 7. Cara Menjalankan Ulang Server (Restart)

1. Jalankan `stop.bat` untuk membebaskan port 3000.
2. Jalankan kembali `start.bat` atau ketik `npm run dev` pada terminal.

---

## 8. Cara Mengatasi Masalah Umum (Troubleshooting)

### Port 3000 Sedang Digunakan (`EADDRINUSE`)
Jika muncul peringatan port 3000 sedang terpakai:
```powershell
# Jalankan stop.bat atau jalankan perintah PowerShell:
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Script Execution Disabled di PowerShell
Jika muncul error `running scripts is disabled on this system`:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

### Node.js Tidak Dikenali di Terminal
Pastikan path Node.js telah ditambahkan ke session PowerShell:
```powershell
$env:PATH = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;" + $env:PATH
```

---

## 9. Cara Menjalankan Aplikasi Menggunakan Satu Perintah

Cukup buka PowerShell dan ketik satu baris berikut:
```powershell
cd "C:\Users\HP 15-ba\.gemini\antigravity\scratch\bengkelpro"; npm run dev
```
Atau klik dua kali file **`start.bat`** di Windows Explorer.

---

## 10. Cara Membangun Produksi (Production Build)

Untuk menguji build mandiri (*standalone production build*) sebelum deployment:
```powershell
# 1. Kompilasi dan optimasi Next.js
npm run build

# 2. Jalankan server produksi
npm run start
```
Atau jalankan server standalone langsung:
```powershell
node .next/standalone/server.js
```

---

## 11. Daftar Alamat & Kredensial Demo

| Peran | URL Akses | Akun Demo | Sandi |
|---|---|---|---|
| **Landing Page** | `http://localhost:3000/` | - | - |
| **Booking Online** | `http://localhost:3000/booking/sahabat-motor` | - | - |
| **Halaman Masuk** | `http://localhost:3000/login` | Tombol Cepat | - |
| **Owner Bengkel** | `http://localhost:3000/owner/dashboard` | `owner@sahabatmotor.id` | `Owner123!` |
| **Admin / Kasir** | `http://localhost:3000/admin/dashboard` | `admin@sahabatmotor.id` | `Admin123!` |
| **Mekanik** | `http://localhost:3000/mechanic/dashboard` | `mekanik@sahabatmotor.id` | `Mekanik123!` |
| **Pelanggan** | `http://localhost:3000/customer/dashboard` | `pelanggan@gmail.com` | `User123!` |
| **Super Admin** | `http://localhost:3000/super-admin/dashboard` | `superadmin@bengkelpro.id` | `Admin123!` |
| **Health API** | `http://localhost:3000/api/health` | - | - |
