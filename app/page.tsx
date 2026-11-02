"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Wrench,
  Users,
  Package,
  Receipt,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  BarChart4,
  Car,
  LayoutDashboard,
  UserCheck,
  Building2,
  Bot,
  Settings,
  ShieldAlert,
  Compass,
  TrendingDown,
  Truck,
  CreditCard,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function LandingPage() {
  const [activeRoleTab, setActiveRoleTab] = useState<"owner" | "admin" | "mechanic" | "customer" | "superadmin">("owner");
  const features = [
    {
      icon: Wrench,
      title: "SPK & Work Order Digital",
      description: "Catat keluhan pelanggan, temuan inspeksi, alokasi mekanik, hingga persetujuan estimasi biaya secara terpusat.",
    },
    {
      icon: CalendarCheck,
      title: "Booking Online & Kuota Antrean",
      description: "Halaman booking mandiri untuk pelanggan bengkel Anda dengan pembatasan kapasitas harian otomatis.",
    },
    {
      icon: Package,
      title: "Inventaris Stok Transaksional",
      description: "Pengurangan stok otomatis yang aman dari manipulasi. Setiap part tercatat dalam mutasi stok (in/out/adjust).",
    },
    {
      icon: Receipt,
      title: "Kasir & Faktur Pajak Otomatis",
      description: "Cetak faktur rapi, dukung pembayaran Tunai, Transfer Bank, dan QRIS instan dengan riwayat pembayaran yang presisi.",
    },
    {
      icon: Sparkles,
      title: "Asisten AI Otomotif Pintar",
      description: "Didukung Google Gemini untuk analisis keluhan kendaraan, estimasi servis, dan tips perawatan berkala.",
    },
    {
      icon: BarChart4,
      title: "Laporan Keuangan & Laba Bersih",
      description: "Ketahui laba kotor, HPP suku cadang, dan laba bersih bengkel secara real-time berdasarkan data transaksi nyata.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Daftar & Atur Bengkel",
      description: "Masukkan informasi bengkel motor/mobil Anda, tambahkan layanan standar, mekanik, dan daftar suku cadang.",
    },
    {
      number: "02",
      title: "Terima Antrean / SPK",
      description: "Buat Surat Perintah Kerja (SPK) saat pelanggan datang atau terima booking online dari web publik bengkel Anda.",
    },
    {
      number: "03",
      title: "Pengerjaan & Catat Part",
      description: "Mekanik mencatat temuan inspeksi dan penggunaan sparepart yang otomatis memotong stok gudang.",
    },
    {
      number: "04",
      title: "Pembayaran & Riwayat",
      description: "Cetak faktur resmi, terima pembayaran, dan riwayat servis kendaraan tersimpan permanen untuk servis berikutnya.",
    },
  ];

  const plans = [
    {
      name: "FREE",
      price: 0,
      description: "Cocok untuk bengkel perorangan yang baru mulai go-digital.",
      features: [
        "1 Bengkel & 1 Akun Owner",
        "Maksimal 30 SPK / bulan",
        "Manajemen Pelanggan & Kendaraan",
        "Daftar Servis Standar",
        "Pencatatan Tunai",
      ],
      highlight: false,
      cta: "Mulai Gratis",
      href: "/register-workshop",
    },
    {
      name: "BASIC",
      price: 49000,
      description: "Ideal untuk bengkel independen dengan volume servis rutin.",
      features: [
        "Hingga 3 Staf (Admin & Mekanik)",
        "SPK & Booking Tanpa Batas",
        "Manajemen Stok & Mutasi Part",
        "Cetak Faktur & Invoice PDF",
        "Riwayat Servis Kendaraan",
        "Laporan Penjualan Dasar",
      ],
      highlight: false,
      cta: "Pilih Paket Basic",
      href: "/register-workshop",
    },
    {
      name: "PRO",
      price: 99000,
      description: "Paling populer untuk bengkel profesional dan modern.",
      features: [
        "Hingga 10 Akun Staf & Mekanik",
        "Semua Fitur Basic",
        "Asisten AI Analisis Keluhan (Gemini)",
        "Laporan Laba/Rugi & HPP Lengkap",
        "Portal Khusus Pelanggan",
        "Pengingat Servis Berkala",
        "Export Laporan ke Excel & PDF",
      ],
      highlight: true,
      cta: "Coba Pro Sekarang",
      href: "/register-workshop",
    },
    {
      name: "BUSINESS",
      price: 199000,
      description: "Solusi lengkap bengkel multi-cabang dan pusat servis resmi.",
      features: [
        "Hingga 25 Akun Staf",
        "Semua Fitur Paket Pro",
        "Manajemen Multi-Cabang Bengkel",
        "Laporan Konsolidasian Cabang",
        "Hak Akses Kustom Lanjutan",
        "Dukungan Prioritas WhatsApp",
      ],
      highlight: false,
      cta: "Pilih Business",
      href: "/register-workshop",
    },
  ];

  const faqs = [
    {
      q: "Apakah data bengkel saya aman dan tidak terlihat bengkel lain?",
      a: "Sangat aman. BengkelPro menggunakan arsitektur Multi-Tenant dengan Row Level Security (RLS) PostgreSQL tingkat bank. Setiap bengkel memiliki ruang data terisolasi yang tidak dapat diakses pihak lain.",
    },
    {
      q: "Apakah bisa digunakan untuk bengkel motor dan bengkel mobil?",
      a: "Bisa. BengkelPro dirancang fleksibel untuk bengkel motor, bengkel mobil, bengkel spesialis matic/CVT, AC mobil, hingga bengkel umum independen di seluruh wilayah Indonesia.",
    },
    {
      q: "Apakah stok suku cadang otomatis berkurang saat servis?",
      a: "Ya. Namun sesuai aturan audit bengkel profesional, stok tidak langsung berkurang saat booking atau SPK dibuat, melainkan saat suku cadang telah disetujui pelanggan dan dikonfirmasi digunakan oleh mekanik.",
    },
    {
      q: "Bagaimana jika koneksi internet lambat?",
      a: "BengkelPro dibangun dengan Next.js yang sangat ringan dan dioptimasi untuk jaringan seluler di Indonesia. Aplikasi responsif dan nyaman digunakan di HP, tablet, maupun komputer kasir.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-bengkel-bg to-white py-20 lg:py-28 border-b border-bengkel-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-bengkel-orange text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Smart Automotive Workshop Management System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-bengkel-navy tracking-tight leading-[1.15]">
                Kelola Bengkel Lebih <span className="text-bengkel-orange">Mudah, Cepat,</span> dan Profesional.
              </h1>

              <p className="text-lg sm:text-xl text-bengkel-muted font-normal leading-relaxed">
                Platform SaaS terintegrasi untuk bengkel motor, mobil, dan servis independen di Indonesia. Hubungkan pemilik, admin kasir, mekanik, dan pelanggan dalam satu sistem cerdas.
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register-workshop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-bengkel-orange hover:bg-bengkel-orange-hover shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 text-base"
                >
                  <span>Mulai Sekarang (Gratis)</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/owner/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-bengkel-navy bg-white border border-gray-300 hover:bg-gray-50 shadow-xs transition-colors text-base"
                >
                  <Wrench className="w-5 h-5 text-bengkel-orange" />
                  <span>Buka Live Demo</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-bengkel-muted">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-bengkel-green" />
                  <span>Multi-Tenant RLS Terisolasi</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-bengkel-green" />
                  <span>Mendukung QRIS & Kas Tunai</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-bengkel-green" />
                  <span>Bahasa & Konvensi Indonesia (WIB)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK STATS / BENEFIT BAR */}
        <section className="bg-bengkel-navy text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-black text-bengkel-orange">100%</div>
                <div className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-medium">Presisi Stok & Kas</div>
              </div>
              <div>
                <div className="text-3xl font-black text-bengkel-orange">5 Role</div>
                <div className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-medium">Owner, Kasir, Mekanik, Pelanggan, Super Admin</div>
              </div>
              <div>
                <div className="text-3xl font-black text-bengkel-orange">34 Tabel</div>
                <div className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-medium">Relasi PostgreSQL Standar Industri</div>
              </div>
              <div>
                <div className="text-3xl font-black text-bengkel-orange">AI Powered</div>
                <div className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-medium">Analisis Keluhan & Rekomendasi Servis</div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE FEATURE HUB (PUSAT AKSES FITUR 1-KLIK) */}
        <section id="pusat-fitur" className="py-16 bg-slate-50 border-b border-bengkel-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-300">
                <Compass className="w-4 h-4 text-amber-600 animate-spin-slow" />
                <span>Pusat Navigasi Fitur Interaktif</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-bengkel-navy tracking-tight">
                Pilih Peran &amp; Jalankan Fitur dengan 1-Klik
              </h2>
              <p className="text-sm sm:text-base text-bengkel-muted">
                Semua fitur terhubung langsung ke data operasional. Klik tombol di bawah untuk membuka dan menguji fitur masing-masing role secara instan dari perangkat Anda.
              </p>
            </div>

            {/* Role Tabs */}
            <div className="flex items-center justify-start md:justify-center px-4 gap-2 pb-6 overflow-x-auto scrollbar-none">
              {[
                { id: "owner" as const, label: "Pemilik (Owner)", icon: "👑", count: 15 },
                { id: "admin" as const, label: "Admin / Kasir", icon: "💼", count: 8 },
                { id: "mechanic" as const, label: "Mekanik Bengkel", icon: "🔧", count: 4 },
                { id: "customer" as const, label: "Pelanggan", icon: "🚗", count: 5 },
                { id: "superadmin" as const, label: "Super Admin", icon: "🛡️", count: 4 },
              ].map((role) => {
                const isActive = activeRoleTab === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRoleTab(role.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "bg-bengkel-navy text-white shadow-lg shadow-navy-900/20 scale-[1.03] border-2 border-amber-400"
                        : "bg-white text-bengkel-text border border-bengkel-border hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-base">{role.icon}</span>
                    <span>{role.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? "bg-amber-400 text-bengkel-navy font-black" : "bg-slate-100 text-slate-500"}`}>
                      {role.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feature Cards Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-bengkel-border shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeRoleTab === "owner" && (
                  <>
                    <Link href="/owner/dashboard" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-orange-100 text-bengkel-orange group-hover:scale-110 transition-transform"><LayoutDashboard className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Dashboard Utama <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Ringkasan omzet, laba kotor & statistik bengkel real-time.</p>
                      </div>
                    </Link>
                    <Link href="/owner/reports" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform"><BarChart4 className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Laporan Laba Rugi <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Pendapatan, HPP part, biaya operasional & estimasi laba bersih.</p>
                      </div>
                    </Link>
                    <Link href="/owner/inventory" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform"><Package className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Inventaris & Stok Part <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Katalog onderdil, stok minimum & riwayat mutasi transaksional.</p>
                      </div>
                    </Link>
                    <Link href="/owner/work-orders" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform"><Wrench className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">SPK / Work Orders <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Kelola siklus servis dari antrean masuk hingga invoice selesai.</p>
                      </div>
                    </Link>
                    <Link href="/owner/invoices" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform"><Receipt className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Kasir & Faktur Invoice <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Kalkulasi jasa, part, PPN 11%, diskon & cetak invoice PDF.</p>
                      </div>
                    </Link>
                    <Link href="/owner/bookings" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-rose-100 text-rose-600 group-hover:scale-110 transition-transform"><CalendarCheck className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Antrean Booking Masuk <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Daftar booking online pelanggan dengan proteksi kuota harian.</p>
                      </div>
                    </Link>
                    <Link href="/owner/customers" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-teal-100 text-teal-600 group-hover:scale-110 transition-transform"><Users className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Data Pelanggan <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Buku kontak pelanggan, riwayat kunjungan & integrasi WhatsApp.</p>
                      </div>
                    </Link>
                    <Link href="/owner/vehicles" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform"><Car className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Kendaraan Terdaftar <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Registrasi plat nomor, tipe motor/mobil & histori servis.</p>
                      </div>
                    </Link>
                    <Link href="/owner/mechanics" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-sky-100 text-sky-600 group-hover:scale-110 transition-transform"><UserCheck className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Kelola Mekanik <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Manajemen staf teknisi dan penugasan beban servis harian.</p>
                      </div>
                    </Link>
                    <Link href="/owner/purchases" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-cyan-100 text-cyan-600 group-hover:scale-110 transition-transform"><Building2 className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Pemasok & Pembelian (PO) <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Pengadaan sparepart ke supplier dan restock gudang.</p>
                      </div>
                    </Link>
                    <Link href="/owner/suppliers" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform"><Truck className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Supplier & Pemasok Part <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Daftar rekanan vendor onderdil, kontak supplier & pengadaan.</p>
                      </div>
                    </Link>
                    <Link href="/owner/expenses" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-red-100 text-red-600 group-hover:scale-110 transition-transform"><TrendingDown className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Pengeluaran Kas Operasional <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Catat beban operasional kas, utilitas, gaji & biaya bengkel.</p>
                      </div>
                    </Link>
                    <Link href="/owner/ai-assistant" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-violet-100 text-violet-600 group-hover:scale-110 transition-transform"><Bot className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Asisten AI Otomotif <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Konsultasi kerusakan kendaraan bertenaga Google Gemini AI.</p>
                      </div>
                    </Link>
                    <Link href="/owner/settings" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-slate-100 text-slate-700 group-hover:scale-110 transition-transform"><Settings className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Pengaturan Bengkel <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Atur profil, kuota harian servis, alamat & logo bengkel.</p>
                      </div>
                    </Link>
                    <Link href="/owner/subscription" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-yellow-100 text-yellow-700 group-hover:scale-110 transition-transform"><CreditCard className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Paket Langganan Bengkel <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Manajemen paket Free, Basic, Pro &amp; Business serta tagihan SaaS.</p>
                      </div>
                    </Link>
                  </>
                )}

                {activeRoleTab === "admin" && (
                  <>
                    <Link href="/admin/dashboard" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-orange-100 text-bengkel-orange group-hover:scale-110 transition-transform"><LayoutDashboard className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Dashboard Kasir <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Ringkasan transaksi kasir, antrean servis & aktivitas harian.</p>
                      </div>
                    </Link>
                    <Link href="/admin/invoices" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform"><Receipt className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Kasir & Faktur Pelanggan <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Proses pembayaran tunai, transfer, QRIS & cetak struk.</p>
                      </div>
                    </Link>
                    <Link href="/admin/bookings" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-rose-100 text-rose-600 group-hover:scale-110 transition-transform"><CalendarCheck className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Antrean Booking Harian <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Check-in kendaraan yang datang untuk servis hari ini.</p>
                      </div>
                    </Link>
                    <Link href="/admin/work-orders" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform"><Wrench className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">SPK & Pengerjaan Servis <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Buat SPK baru, catat keluhan & alokasikan teknisi.</p>
                      </div>
                    </Link>
                    <Link href="/admin/inventory" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform"><Package className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Cek Stok Sparepart <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Lihat stok oli, busi, kampas rem & part gudang.</p>
                      </div>
                    </Link>
                    <Link href="/admin/customers" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-teal-100 text-teal-600 group-hover:scale-110 transition-transform"><Users className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Database Pelanggan <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Cari data pelanggan lama atau daftarkan pelanggan baru.</p>
                      </div>
                    </Link>
                    <Link href="/admin/vehicles" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform"><Car className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Registrasi Kendaraan <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Catat plat nomor dan riwayat odometer servis.</p>
                      </div>
                    </Link>
                    <Link href="/admin/settings" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-slate-100 text-slate-700 group-hover:scale-110 transition-transform"><Settings className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Pengaturan Profil Admin <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Kelola profil akun kasir, keamanan & preferensi profil.</p>
                      </div>
                    </Link>
                  </>
                )}

                {activeRoleTab === "mechanic" && (
                  <>
                    <Link href="/mechanic/jobs" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform"><Wrench className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Daftar SPK Pengerjaan Saya <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Lihat pekerjaan servis dan checklist perbaikan dari HP.</p>
                      </div>
                    </Link>
                    <Link href="/mechanic/history" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform"><CalendarCheck className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Riwayat Pekerjaan Selesai <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Arsip unit kendaraan yang telah Anda selesaikan.</p>
                      </div>
                    </Link>
                    <Link href="/mechanic/dashboard" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform"><LayoutDashboard className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Dashboard Kinerja Mekanik <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Pantau total servis harian dan metrik performa teknisi.</p>
                      </div>
                    </Link>
                    <Link href="/mechanic/profile" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform"><UserCheck className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Profil & Keahlian Mekanik <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Informasi sertifikasi dan bidang keahlian perbaikan.</p>
                      </div>
                    </Link>
                  </>
                )}

                {activeRoleTab === "customer" && (
                  <>
                    <Link href="/booking/sahabat-motor" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-orange-100 text-bengkel-orange group-hover:scale-110 transition-transform"><CalendarCheck className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Form Booking Online Mandiri <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Pilih tanggal, jam & jenis servis langsung dari smartphone.</p>
                      </div>
                    </Link>
                    <Link href="/customer/dashboard" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform"><LayoutDashboard className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Status Pengerjaan Servis <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Lacak tahapan inspeksi, pengerjaan hingga unit siap diambil.</p>
                      </div>
                    </Link>
                    <Link href="/customer/service-history" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform"><Wrench className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Buku Servis Digital <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Histori penggantian oli, onderdil & kilometer kendaraan.</p>
                      </div>
                    </Link>
                    <Link href="/customer/vehicles" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform"><Car className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Garasi Kendaraan Saya <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Kelola data motor atau mobil yang terhubung ke akun Anda.</p>
                      </div>
                    </Link>
                    <Link href="/customer/invoices" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform"><Receipt className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Faktur & Bukti Pembayaran <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Lihat dan unduh struk pembayaran digital resmi.</p>
                      </div>
                    </Link>
                  </>
                )}

                {activeRoleTab === "superadmin" && (
                  <>
                    <Link href="/super-admin/dashboard" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-rose-100 text-rose-600 group-hover:scale-110 transition-transform"><LayoutDashboard className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Dashboard Monitoring Global <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Statistik ekosistem platform seluruh bengkel di Indonesia.</p>
                      </div>
                    </Link>
                    <Link href="/super-admin/registrations" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform"><Building2 className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Persetujuan Bengkel Baru <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Review verifikasi berkas dan aktivasi bengkel baru.</p>
                      </div>
                    </Link>
                    <Link href="/super-admin/audit-logs" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-slate-100 text-slate-700 group-hover:scale-110 transition-transform"><ShieldAlert className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Audit Log Keamanan <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Rekam jejak login, perubahan data & keamanan sistem.</p>
                      </div>
                    </Link>
                    <Link href="/super-admin/users" className="p-4 rounded-2xl border border-bengkel-border hover:border-bengkel-orange hover:bg-orange-50/30 transition-all group flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-teal-100 text-teal-600 group-hover:scale-110 transition-transform"><Users className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange flex items-center gap-1">Pengguna Seluruh Platform <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></div>
                        <p className="text-xs text-bengkel-muted mt-1">Direktori terpusat akun owner, kasir, mekanik & pelanggan.</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN FEATURES SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-bengkel-orange uppercase tracking-wider">Fitur Komprehensif</span>
              <h2 className="text-3xl sm:text-4xl font-black text-bengkel-navy tracking-tight">
                Satu Sistem untuk Seluruh Alur Operasional Bengkel
              </h2>
              <p className="text-sm sm:text-base text-bengkel-muted">
                Tinggalkan pencatatan manual kertas atau nota hilang. BengkelPro mengintegrasikan setiap tahap pekerjaan bengkel secara presisi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl border border-bengkel-border bg-bengkel-bg/50 hover:bg-white hover:border-bengkel-orange/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-bengkel-orange-light text-bengkel-orange flex items-center justify-center mb-5 shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-bengkel-navy mb-2">{feat.title}</h3>
                      <p className="text-sm text-bengkel-muted leading-relaxed">{feat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 bg-bengkel-bg border-y border-bengkel-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-bengkel-orange uppercase tracking-wider">Langkah Mudah</span>
              <h2 className="text-3xl sm:text-4xl font-black text-bengkel-navy tracking-tight">
                Cara Kerja BengkelPro di Lapangan
              </h2>
              <p className="text-sm sm:text-base text-bengkel-muted">
                Alur kerja standar bengkel modern yang mudah dipahami pemilik, kasir, dan mekanik.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-bengkel-border shadow-xs relative overflow-hidden">
                  <div className="text-4xl font-black text-bengkel-orange/20 mb-3">{step.number}</div>
                  <h3 className="text-base font-bold text-bengkel-navy mb-2">{step.title}</h3>
                  <p className="text-xs text-bengkel-muted leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-20 bg-white" id="pricing">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-bengkel-orange uppercase tracking-wider">Transparan & Terjangkau</span>
              <h2 className="text-3xl sm:text-4xl font-black text-bengkel-navy tracking-tight">
                Pilih Paket Sesuai Kebutuhan Bengkel Anda
              </h2>
              <p className="text-sm sm:text-base text-bengkel-muted">
                Investasi cerdas yang langsung meningkatkan omzet dan efisiensi operasional bengkel Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                    plan.highlight
                      ? "bg-bengkel-navy text-white border-2 border-bengkel-orange shadow-xl relative scale-105 z-10"
                      : "bg-white text-bengkel-text border border-bengkel-border shadow-xs hover:shadow-md"
                  }`}
                >
                  <div>
                    {plan.highlight && (
                      <div className="inline-block px-3 py-1 bg-bengkel-orange text-white text-[10px] font-bold uppercase rounded-full mb-3 tracking-wider">
                        Paling Direkomendasikan
                      </div>
                    )}
                    <h3 className={`text-lg font-black tracking-tight ${plan.highlight ? "text-white" : "text-bengkel-navy"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs mt-1 min-h-[32px] ${plan.highlight ? "text-gray-300" : "text-bengkel-muted"}`}>
                      {plan.description}
                    </p>

                    <div className="my-6">
                      <div className="text-3xl font-black tracking-tight">
                        {plan.price === 0 ? "Gratis" : formatRupiah(plan.price)}
                      </div>
                      <div className={`text-[11px] ${plan.highlight ? "text-gray-400" : "text-bengkel-muted"}`}>
                        {plan.price === 0 ? "Selamanya untuk 1 bengkel" : "per bulan (dibayar bulanan)"}
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-gray-100/20 text-xs">
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2">
                          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-bengkel-orange" : "text-bengkel-green"}`} />
                          <span className={plan.highlight ? "text-gray-200" : "text-bengkel-text"}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <Link
                      href={plan.href}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        plan.highlight
                          ? "bg-bengkel-orange hover:bg-bengkel-orange-hover text-white shadow-md shadow-orange-500/30"
                          : "bg-bengkel-navy text-white hover:bg-bengkel-navy-light"
                      }`}
                    >
                      <span>{plan.cta}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-bengkel-bg border-t border-bengkel-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 space-y-3">
              <span className="text-xs font-bold text-bengkel-orange uppercase tracking-wider">Tanya Jawab</span>
              <h2 className="text-3xl font-black text-bengkel-navy tracking-tight">Pertanyaan yang Sering Diajukan</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-bengkel-border shadow-xs">
                  <h3 className="text-base font-bold text-bengkel-navy mb-2">{faq.q}</h3>
                  <p className="text-sm text-bengkel-muted leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-16 bg-gradient-to-r from-bengkel-navy to-bengkel-navy-light text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Siap Mentransformasi Bengkel Anda Menjadi Lebih Profesional?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
              Daftarkan bengkel Anda sekarang tanpa biaya setup. Tingkatkan omzet, kendalikan stok tanpa bocor, dan berikan kepuasan maksimal bagi pelanggan.
            </p>
            <div className="pt-2">
              <Link
                href="/register-workshop"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-bengkel-orange hover:bg-bengkel-orange-hover shadow-lg shadow-orange-500/30 text-base"
              >
                <span>Daftar Bengkel Sekarang</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
