import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Wrench,
  CalendarCheck,
  Package,
  Receipt,
  Sparkles,
  BarChart4,
  Users,
  Car,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  QrCode,
  FileSpreadsheet,
} from "lucide-react";

export default function FeaturesPage() {
  const modules = [
    {
      category: "Operasional Servis",
      items: [
        {
          icon: Wrench,
          title: "Surat Perintah Kerja (SPK)",
          desc: "Workflow servis lengkap: Menunggu -> Inspeksi -> Estimasi Biaya -> Persetujuan Pelanggan -> Pengerjaan -> Pengecekan Akhir -> Faktur.",
        },
        {
          icon: CalendarCheck,
          title: "Booking Online & Kuota Antrean",
          desc: "Halaman web booking per-bengkel (/booking/[slug]), pembatasan kapasitas harian, dan pencegahan double-booking kendaraan.",
        },
        {
          icon: Users,
          title: "Manajemen Tim Mekanik",
          desc: "Alokasi mekanik utama dan pembantu pada setiap pekerjaan, monitoring beban kerja aktif, dan metrik performa teknisi.",
        },
        {
          icon: Clock,
          title: "Riwayat Servis & Pengingat Rutin",
          desc: "Pencatatan riwayat kerusakan, pekerjaan yang dilakukan, part yang diganti, serta rekomendasi servis dan kilometer berikutnya.",
        },
      ],
    },
    {
      category: "Inventaris & Pengadaan",
      items: [
        {
          icon: Package,
          title: "Manajemen Stok & Suku Cadang",
          desc: "Katalog suku cadang dengan SKU unik, harga beli (HPP), harga jual, batas minimum stok, dan mutasi otomatis yang aman dari kebocoran.",
        },
        {
          icon: Truck,
          title: "Supplier & Purchase Order (PO)",
          desc: "Pencatatan data pemasok suku cadang, pembuatan PO pengadaan, dan penambahan stok hanya setelah penerimaan barang diverifikasi.",
        },
        {
          icon: FileSpreadsheet,
          title: "Audit Mutasi Stok (Stock Movement)",
          desc: "Setiap part yang masuk atau keluar memiliki catatan mutasi yang tidak dapat diedit atau dimanipulasi.",
        },
      ],
    },
    {
      category: "Keuangan & Kasir",
      items: [
        {
          icon: Receipt,
          title: "Faktur & Invoice Resmi",
          desc: "Perhitungan subtotal jasa, suku cadang, diskon promosi, dan pajak secara server-side. Cetak invoice dan export PDF.",
        },
        {
          icon: QrCode,
          title: "Dukungan QRIS & Multi-Pembayaran",
          desc: "Terima pembayaran Tunai (Cash), Transfer Bank, dan QRIS instan dengan verifikasi status lunas atau pembayaran bertahap (DP).",
        },
        {
          icon: BarChart4,
          title: "Laporan Laba/Rugi Real-Time",
          desc: "Pendapatan jasa, omzet part, HPP (Cost of Goods Sold), biaya operasional (listrik, air, gaji), hingga laba bersih bengkel.",
        },
      ],
    },
    {
      category: "Teknologi Cerdas & Keamanan",
      items: [
        {
          icon: Sparkles,
          title: "Asisten AI Otomotif Pintar",
          desc: "Didukung Google Gemini API untuk membantu menganalisis keluhan suara kendaraan, saran checklist inspeksi, dan ringkasan perbaikan.",
        },
        {
          icon: ShieldCheck,
          title: "Multi-Tenant & Keamanan Data (RLS)",
          desc: "Row Level Security PostgreSQL menjamin data bengkel Anda 100% terisolasi dan tidak dapat diintip bengkel lain.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-bengkel-bg flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-bengkel-orange uppercase tracking-wider">Modul Sistem Lengkap</span>
          <h1 className="text-4xl font-black text-bengkel-navy tracking-tight">
            Fitur Terbaik Dirancang untuk Kebutuhan Nyata Bengkel
          </h1>
          <p className="text-base text-bengkel-muted">
            Solusi menyeluruh dari gerbang masuk kendaraan, penanganan mekanik di pit servis, hingga laporan laba bersih di meja pemilik.
          </p>
        </div>

        <div className="space-y-12">
          {modules.map((group, idx) => (
            <div key={idx} className="space-y-6">
              <h2 className="text-xl font-black text-bengkel-navy border-b border-bengkel-border pb-3">
                {group.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((it, iIdx) => {
                  const Icon = it.icon;
                  return (
                    <div
                      key={iIdx}
                      className="bg-white p-6 rounded-2xl border border-bengkel-border shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-xl bg-bengkel-orange-light text-bengkel-orange flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-bengkel-navy mb-2">{it.title}</h3>
                      <p className="text-xs text-bengkel-muted leading-relaxed">{it.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
