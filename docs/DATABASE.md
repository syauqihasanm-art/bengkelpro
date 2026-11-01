# BengkelPro — Database Architecture & Schema Documentation

Database BengkelPro dibangun menggunakan **PostgreSQL** di atas infrastruktur Supabase dengan **34 Tabel Relasional Ternormalisasi** dan penegakan **Row Level Security (RLS)**.

---

## 1. Daftar 34 Tabel Relasional

| No | Nama Tabel | Deskripsi & Tujuan | Primary Key / Index |
| :--- | :--- | :--- | :--- |
| 1 | `profiles` | Data profil pengguna terikat pada `auth.users` | UUID (`id`), Email |
| 2 | `roles` | Kamus peran pengguna (super_admin, owner, admin, mechanic, customer) | Serial (`id`), Name |
| 3 | `permissions` | Kode izin hak akses granular | Serial (`id`), Code |
| 4 | `workshops` | Entitas induk bengkel (Root Tenant) | UUID (`id`), Slug |
| 5 | `workshop_members` | Pemetaan keanggotaan staf dalam bengkel tenant | UUID (`id`), (workshop_id, user_id) |
| 6 | `workshop_branches` | Informasi multi-cabang bengkel (Paket Business) | UUID (`id`), workshop_id |
| 7 | `customers` | Data pelanggan pemilik kendaraan | UUID (`id`), (workshop_id, phone) |
| 8 | `customer_accounts` | Penghubung profil user dengan data pelanggan bengkel | UUID (`id`), (customer_id, user_id) |
| 9 | `vehicles` | Data motor & mobil dengan odometer pelacakan | UUID (`id`), (workshop_id, license_plate) |
| 10 | `services` | Katalog paket servis & tarif jasa standar | UUID (`id`), (workshop_id, code) |
| 11 | `bookings` | Reservasi booking servis dan antrean harian | UUID (`id`), (workshop_id, booking_code) |
| 12 | `booking_status_history`| Jejak audit riwayat status booking | UUID (`id`), booking_id |
| 13 | `work_orders` | Surat Perintah Kerja (SPK) & alur perbaikan | UUID (`id`), (workshop_id, work_order_number) |
| 14 | `work_order_items` | Rincian item jasa dan suku cadang pada SPK | UUID (`id`), work_order_id |
| 15 | `work_order_status_history`| Audit log transisi status SPK | UUID (`id`), work_order_id |
| 16 | `mechanics` | Data profil teknisi, keahlian & rating kepuasan | UUID (`id`), workshop_id |
| 17 | `mechanic_assignments` | Alokasi mekanik utama & asisten pada SPK | UUID (`id`), (work_order_id, mechanic_id) |
| 18 | `categories` | Kategori produk dan jasa servis | UUID (`id`), workshop_id |
| 19 | `products` | Katalog suku cadang, SKU, HPP, harga jual & stok | UUID (`id`), (workshop_id, sku) |
| 20 | `suppliers` | Data mitra pemasok spare part | UUID (`id`), workshop_id |
| 21 | `purchases` | Purchase Order (PO) pengadaan barang ke supplier | UUID (`id`), (workshop_id, purchase_number) |
| 22 | `purchase_items` | Rincian part, jumlah, dan biaya unit PO | UUID (`id`), purchase_id |
| 23 | `stock_movements` | **Immutable Audit Log Mutasi Stok** (in/out/adjust) | UUID (`id`), (workshop_id, product_id) |
| 24 | `invoices` | Faktur resmi servis, rincian tagihan, diskon & pajak | UUID (`id`), (workshop_id, invoice_number) |
| 25 | `invoice_items` | Rincian baris biaya jasa dan suku cadang faktur | UUID (`id`), invoice_id |
| 26 | `payments` | Rekam pembayaran kasir (Tunai, Transfer, QRIS) | UUID (`id`), invoice_id, idempotency_key |
| 27 | `expenses` | Beban operasional kas (listrik, air, gaji, perlengkapan) | UUID (`id`), (workshop_id, expense_date) |
| 28 | `service_histories` | Buku servis digital kendaraan permanen | UUID (`id`), (vehicle_id, service_date) |
| 29 | `notifications` | Notifikasi in-app booking, SPK, dan stok menipis | UUID (`id`), user_id |
| 30 | `subscriptions` | Paket langganan SaaS bengkel tenant | UUID (`id`), workshop_id |
| 31 | `subscription_payments`| Riwayat bukti bayar langganan platform | UUID (`id`), subscription_id |
| 32 | `audit_logs` | Jejak rekam aktivitas sensitif sistem | UUID (`id`), (workshop_id, created_at) |
| 33 | `support_tickets` | Tiket bantuan teknis bengkel ke platform | UUID (`id`), workshop_id |
| 34 | `ai_usage_logs` | Catatan konsumsi token dan fitur AI Gemini | UUID (`id`), (workshop_id, created_at) |

---

## 2. Row Level Security (RLS) & Multi-Tenant Enforcement

Semua tabel operasional menerapkan kebijakan RLS berbasis fungsi PostgreSQL `is_workshop_member(workshop_id)`:

```sql
CREATE OR REPLACE FUNCTION is_workshop_member(target_workshop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workshop_members
        WHERE workshop_id = target_workshop_id
          AND user_id = auth.uid()
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Pengguna yang terafiliasi dengan Bengkel A secara mutlak diisolasi dan dicegah oleh engine database PostgreSQL untuk melakukan `SELECT`, `INSERT`, `UPDATE`, atau `DELETE` pada baris data milik Bengkel B.
