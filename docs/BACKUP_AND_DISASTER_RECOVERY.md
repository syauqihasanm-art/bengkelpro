# PROSEDUR BACKUP, DISASTER RECOVERY & DATA RETENTION BENGKELPRO
**Sistem Manajemen Bengkel Cerdas — Production Reliability Standard**

Dokumen ini mendefinisikan strategi pencadangan (backup), pemulihan bencana (disaster recovery), dan retensi data untuk aplikasi produksi BengkelPro.

---

## 1. STRATEGI PENCADANGAN DATABASE (SUPABASE POSTGRESQL)

Database BengkelPro menyimpan seluruh data transaksional, multi-tenant workshop, profil pelanggan, riwayat servis, inventaris, dan pencatatan keuangan.

### A. Automated Point-in-Time Recovery (PITR) — Supabase Pro
- **Frekuensi**: Kontinu (Write-Ahead Logging / WAL archiving secara real-time) dan snapshot harian otomatis.
- **Periode Retensi**: 7 hari (standar Supabase Pro) atau 30 hari (dengan add-on).
- **RPO (Recovery Point Objective)**: < 5 menit.
- **RTO (Recovery Time Objective)**: < 30 menit.

### B. Logical Dump Rutin (Scheduled `pg_dump`)
Selain backup otomatis managed Supabase, tim DevOps menjalankan pencadangan logikal terjadwal ke penyimpanan terenkripsi eksternal (AWS S3 / Cloudflare R2 / Wasabi):

```bash
# Perintah dump skema dan data terkompresi
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="bengkelpro_backup_$(date +%Y%m%d_%H%M%S).dump"
```

---

## 2. STRATEGI PENCADANGAN STORAGE (FILE & DOKUMEN FISIK)

> [!IMPORTANT]
> Backup database PostgreSQL **TIDAK** mencakup file biner fisik yang tersimpan di bucket Supabase Storage (seperti foto kendaraan saat inspeksi, lampiran nota supplier, dokumen bengkel, dan invoice PDF). Pencadangan storage harus dilakukan secara terpisah.

### Bucket Supabase Storage yang Dicadangkan:
1. `vehicle-photos`: Foto kondisi kendaraan sebelum dan sesudah servis.
2. `invoice-attachments`: Lampiran bukti transfer pembayaran dan faktur fisik.
3. `workshop-documents`: Dokumen legalitas bengkel dan surat izin usaha.
4. `workshop-media`: Logo bengkel dan materi publikasi.

### Prosedur Sinkronisasi Storage Menggunakan `rclone`:
Supabase Storage menyediakan endpoint kompatibel S3. Gunakan `rclone` atau AWS CLI untuk menyinkronkan seluruh bucket setiap hari:

```bash
# Konfigurasi rclone untuk Supabase Storage S3
rclone sync supabase-storage:vehicle-photos encrypted-backup:bengkelpro-backups/storage/vehicle-photos
rclone sync supabase-storage:invoice-attachments encrypted-backup:bengkelpro-backups/storage/invoice-attachments
rclone sync supabase-storage:workshop-documents encrypted-backup:bengkelpro-backups/storage/workshop-documents
```

---

## 3. PROSEDUR PEMULIHAN BENCANA (DISASTER RECOVERY RUNBOOK)

### Skenario 1: Rollback ke Titik Waktu Tertentu (PITR via Supabase)
1. Buka dashboard Supabase: **Project Settings** -> **Database** -> **Backups**.
2. Pilih tab **Point in Time**.
3. Tentukan timestamp target (misal: 10 menit sebelum insiden terjadi).
4. Klik **Restore database to this point**.
5. Tunggu proses selesai dan jalankan smoke test pada `/api/health`.

### Skenario 2: Pemulihan Penuh dari File Dump ke Instance Baru
Jika terjadi kegagalan server total atau bencana pusat data:
1. Siapkan database PostgreSQL / Supabase baru.
2. Eksekusi skema awal:
   ```bash
   psql -h [NEW_HOST] -U postgres -d postgres -f migrations/001_initial_schema.sql
   psql -h [NEW_HOST] -U postgres -d postgres -f migrations/002_storage_and_indexes.sql
   ```
3. Pulihkan data transaksional dari dump terakhir:
   ```bash
   pg_restore -h [NEW_HOST] -U postgres -d postgres --clean --if-exists bengkelpro_backup_latest.dump
   ```
4. Perbarui variabel lingkungan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` pada platform hosting (Railway/Vercel).
5. Lakukan deploy ulang aplikasi.

---

## 4. PROTOKOL PENGUJIAN PEMULIHAN (RECOVERY TESTING DRILL)

- **Jadwal Pengujian**: Dilakukan setiap 3 bulan (Quarterly Recovery Drill).
- **Checklist Verifikasi Pasca-Pemulihan**:
  1. `GET /api/health` mengembalikan status `200 OK` dengan database `healthy`.
  2. Data workshop demo (`sahabat-motor`) dapat diakses tanpa kehilangan relasi.
  3. Integritas saldo kas, laporan laba rugi, dan stok barang cocok 100% dengan histori pergerakan stok (`stock_movements`).
  4. Autentikasi 5 role (Super Admin, Owner, Admin, Mechanic, Customer) berfungsi normal.

---

## 5. KEBIJAKAN RETENSI DATA (DATA RETENTION POLICY)

Sesuai regulasi perpajakan dan perlindungan data pribadi di Indonesia:
- **Transaksi Keuangan & Invoice**: Disimpan minimal **10 tahun** untuk kepatuhan audit pembukuan.
- **Audit Logs Operasional**: Disimpan minimal **2 tahun** secara terenkripsi.
- **Foto Kendaraan & Dokumen Kerja Servis**: Disimpan aktif selama **3 tahun**, setelah itu dapat diarsipkan ke cold storage.
- **Data Pelanggan (UU PDP No. 27/2022)**: Data pribadi dienkripsi saat transit (TLS 1.3) dan saat diam (AES-256). Hak penghapusan akun menghormati retensi transaksi yang wajib disimpan menurut hukum.
