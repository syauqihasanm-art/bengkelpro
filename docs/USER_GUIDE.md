# BengkelPro — Panduan Pengguna (User Guide)

Selamat datang di **BengkelPro — Smart Automotive Workshop Management System**. Panduan ini dirancang untuk memandu setiap pemangku kepentingan dalam menjalankan operasional bengkel sehari-hari.

---

## 1. Panduan untuk Pemilik Bengkel (Owner)
1. **Pendaftaran Bengkel**:
   - Buka `/register-workshop`.
   - Masukkan nama bengkel, nama pemilik, nomor WhatsApp, kategori (motor/mobil), dan alamat lengkap.
   - Setelah mendaftar, Anda langsung memiliki akses ke Dashboard Pemilik.
2. **Menambahkan Suku Cadang Awal**:
   - Masuk ke menu **Stok Spare Part** (`/owner/inventory`).
   - Klik tombol **+ Tambah Part Baru**, masukkan SKU (contoh: `OIL-10W40`), HPP (harga beli), dan harga jual.
3. **Memonitor Laporan Finansial**:
   - Buka menu **Laporan Keuangan** (`/owner/reports`).
   - Lihat rincian Omzet Kasir, HPP Suku Cadang Terpakai, Laba Kotor, Biaya Operasional, dan Laba Bersih riil tanpa spekulasi.

---

## 2. Panduan untuk Admin / Kasir Bengkel
1. **Menerima Kendaraan & Membuat SPK**:
   - Masuk ke menu **SPK / Work Order** (`/admin/work-orders`).
   - Pilih pelanggan dan kendaraan, catat keluhan, lalu terbitkan SPK.
2. **Mengelola Pembayaran di Kasir**:
   - Masuk ke menu **Faktur & Kasir** (`/admin/invoices`).
   - Klik tombol **Bayar** pada tagihan yang bersangkutan.
   - Pilih metode (Tunai, QRIS, atau Transfer Bank) dan klik **Konfirmasi Pembayaran**.
   - Klik ikon **Printer** untuk mencetak struk/faktur fisik kepada pelanggan.

---

## 3. Panduan untuk Teknisi & Mekanik
1. **Melihat Pekerjaan yang Ditugaskan**:
   - Masuk ke **Portal Mekanik** (`/mechanic/dashboard` atau `/mechanic/jobs`).
   - Klik **Buka Tugas Servis** pada kendaraan yang hendak diperbaiki.
2. **Inspeksi & Catat Temuan**:
   - Masukkan temuan fisik mesin/rem pada kolom catatan inspeksi.
   - Setelah kendaraan selesai diperbaiki dan diuji coba, klik tombol hijau **Tandai Servis Selesai & Kirim ke Kasir**.

---

## 4. Panduan untuk Pelanggan (Customer)
1. **Booking Servis Online Tanpa Antre**:
   - Buka halaman booking bengkel langganan Anda (contoh: `/booking/sahabat-motor`).
   - Pilih tanggal dan jam kedatangan yang tersedia, masukkan plat nomor dan keluhan.
   - Simpan kode booking yang muncul di layar dan tunjukkan kepada petugas kasir saat tiba di bengkel.
2. **Melihat Buku Servis Digital**:
   - Masuk ke portal pelanggan (`/customer/service-history`) untuk melihat seluruh riwayat perbaikan motor/mobil Anda.
