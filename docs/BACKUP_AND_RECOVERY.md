# BengkelPro — Backup & Disaster Recovery Guide

Dokumen ini menjamin kelangsungan bisnis (*Business Continuity Plan*) dan prosedur pemulihan bencana (*Disaster Recovery*) untuk database operasional bengkel di BengkelPro.

---

## 1. Strategi Backup Otomatis (Supabase Pro)

### A. Point-in-Time Recovery (PITR)
- Supabase Pro mengaktifkan **Write-Ahead Logging (WAL)** kontinu dengan retensi pemulihan hingga 7 hari (dapat diperpanjang hingga 30 hari).
- Memungkinkan pemulihan database ke detik tertentu sebelum terjadi insiden kerusakan data atau human error.

### B. Daily Snapshots
- Backup snapshot harian otomatis dibuat setiap pukul 02:00 WIB (luar jam sibuk operasional bengkel).
- Snapshot disimpan di cloud storage terenkripsi (AES-256) dengan redundansi multi-region.

---

## 2. Prosedur Manual Backup (Cold Backup)
Admin DevOps dapat mengekspor dump PostgreSQL secara mandiri menggunakan `pg_dump`:

```bash
# Export seluruh skema dan data
pg_dump -h db.[project-ref].supabase.co -U postgres -d postgres -F c -b -v -f bengkelpro_backup_$(date +%Y%m%d).dump
```

---

## 3. Prosedur Pemulihan (Disaster Recovery)

Jika terjadi insiden kegagalan sistem total:
1. **Restorasi Database**:
   ```bash
   pg_restore -h db.[new-project-ref].supabase.co -U postgres -d postgres -v bengkelpro_backup.dump
   ```
2. **Verifikasi Integritas RLS**:
   Jalankan query audit untuk memastikan Row Level Security aktif pada seluruh 34 tabel:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```
3. **Penyambungan Ulang Backend**:
   Perbarui `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` pada Railway Environment Variables.
4. **Verifikasi Endpoint Kesehatan**:
   Akses `https://[domain-produksi]/api/health` dan pastikan field `checks.database` bernilai `"healthy"`.
