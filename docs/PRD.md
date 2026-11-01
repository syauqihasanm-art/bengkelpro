# BengkelPro — Product Requirements Document (PRD)

## 1. Product Identity
- **Product Name**: BengkelPro
- **Full Product Name**: BengkelPro — Smart Automotive Workshop Management System
- **Tagline**: *"Kelola Bengkel Lebih Mudah, Cepat, dan Profesional."*
- **Product Category**: Automotive Technology / SaaS / Workshop Management System
- **Target Market**: Seluruh wilayah Indonesia (WIB/WITA/WIT)
- **Primary Customers**:
  - Bengkel Sepeda Motor independen & jaringan
  - Bengkel Perbaikan & Perawatan Mobil
  - Bengkel AC, Spesialis Matic/CVT, & Kaki-Kaki
  - Usaha mikro, kecil, dan menengah (UMKM) otomotif
  - Service center otomotif profesional

---

## 2. Product Vision & Problem Statement
Operasional bengkel di Indonesia secara historis menghadapi 4 masalah kritis:
1. **Kebocoran Stok Spare Part**: Pengurangan stok tanpa pencatatan mutasi transaksional.
2. **Kekacauan Antrean & Kehilangan Pelanggan**: Pencatatan manual di kertas sering tercecer.
3. **Ketidakpastian Biaya**: Pelanggan kecewa karena biaya akhir membengkak tanpa persetujuan awal.
4. **Pembukuan Finansial Fiktif**: Sulit memisahkan omzet kotor, modal HPP suku cadang, dan laba bersih riil.

**Visi BengkelPro**:
Membangun platform cloud terintegrasi yang menghubungkan pemilik bengkel, kasir, mekanik, dan pemilik kendaraan dalam satu alur kerja transparan, akurat, dan aman.

---

## 3. User Roles and Responsibilities
Sistem menerapkan 5 peran (roles) dengan izin berbasis server (RBAC):

1. **Super Admin Platform**:
   - Pengawasan seluruh bengkel terdaftar di platform.
   - Persetujuan (Approval), penolakan, atau penangguhan (Suspension) akun bengkel.
   - Pengelolaan paket langganan dan pemantauan MRR platform.
   - Audit log keamanan sistem.

2. **Workshop Owner (Pemilik Bengkel)**:
   - Kendali penuh operasional dan keuangan bengkel tenant.
   - Dashboard analitik: Omzet, HPP, Laba Kotor, Biaya Operasional, Laba Bersih.
   - Pengelolaan akun staf, tarif jasa, katalog part, supplier, dan langganan SaaS.

3. **Workshop Admin (Kasir / Front Desk)**:
   - Manajemen antrean kendaraan dan pendaftaran booking online.
   - Penerbitan Surat Perintah Kerja (SPK) awal dan alokasi mekanik.
   - Kasir pembayaran (Tunai, Transfer Bank, QRIS).

4. **Mechanic (Teknisi Bengkel)**:
   - Akses daftar tugas servis aktif di pit servis.
   - Penginputan temuan inspeksi fisik dan checklist kendaraan.
   - Konfirmasi suku cadang terpakai yang memicu pemotongan stok otomatis.

5. **Customer (Pemilik Kendaraan)**:
   - Pendaftaran dan manajemen data motor/mobil pribadi.
   - Booking servis mandiri secara online (/booking/[slug]).
   - Pemantauan live progress pekerjaan servis secara transparan.
   - Akses buku servis digital dan faktur tagihan resmi.

---

## 4. Multi-Tenant Architecture & Data Isolation
- Setiap entitas data (Pelanggan, Kendaraan, SPK, Stok, Mutasi, Faktur, Pembayaran, Biaya) memiliki relasi wajib `workshop_id`.
- PostgreSQL Row Level Security (RLS) menjamin bahwa data privat satu bengkel tidak dapat diakses oleh bengkel lain dalam kondisi apapun.
