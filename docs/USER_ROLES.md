# BengkelPro — User Roles & Permission Matrix

Dokumen ini mendefinisikan matriks wewenang untuk 5 peran pengguna di sistem BengkelPro:

## Matriks Perizinan Fitur

| Modul & Fitur | Super Admin | Workshop Owner | Workshop Admin | Mechanic | Customer |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Persetujuan Registrasi Bengkel** |  YA |  TIDAK |  TIDAK |  TIDAK |  TIDAK |
| **Konfigurasi Langganan SaaS** |  YA |  YA |  TIDAK |  TIDAK |  TIDAK |
| **Laporan Laba/Rugi & HPP Finansial** | ⚠️ Audit |  YA |  TIDAK |  TIDAK |  TIDAK |
| **Kelola Pengeluaran Kas Operasional** |  TIDAK |  YA |  YA |  TIDAK |  TIDAK |
| **Manajemen Pelanggan & Kendaraan** |  TIDAK |  YA |  YA | ⚠️ Baca | ⚠️ Milik Sendiri |
| **Booking & Konfirmasi Antrean** |  TIDAK |  YA |  YA | ⚠️ Baca |  Buat Booking |
| **Pembuatan & Penugasan SPK** |  TIDAK |  YA |  YA |  TIDAK |  TIDAK |
| **Inspeksi Fisik & Catat Part SPK** |  TIDAK |  YA |  YA |  YA |  TIDAK |
| **ACC Estimasi Biaya SPK** |  TIDAK |  YA |  TIDAK |  TIDAK |  YA |
| **Katalog Part & Penyesuaian Stok** |  TIDAK |  YA |  YA | ⚠️ Baca |  TIDAK |
| **Penerimaan Barang Supplier (PO)** |  TIDAK |  YA |  YA |  TIDAK |  TIDAK |
| **Penerbitan Faktur & Terima Kasir** |  TIDAK |  YA |  YA |  TIDAK | ⚠️ Bayar Tagihan |
| **Asisten AI Otomotif Gemini** |  TIDAK |  YA |  YA |  YA | ⚠️ Tips Dasar |
| **Buku Servis Digital Kendaraan** |  TIDAK |  YA |  YA |  YA |  YA (Miliknya) |
