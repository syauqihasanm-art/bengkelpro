"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Wrench,
  ShieldCheck,
  Zap,
  TrendingUp,
  Users,
  Package,
  Receipt,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Smartphone,
  BarChart4,
  Clock,
  Car,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function LandingPage() {
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
