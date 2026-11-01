import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Check, X, Shield, ArrowRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function PricingPage() {
  const tiers = [
    {
      name: "FREE",
      price: 0,
      description: "Untuk bengkel perorangan atau bengkel yang baru merintis digitalisasi.",
      staffLimit: "1 Staf (Owner)",
      woLimit: "30 SPK / bulan",
      features: {
        booking: true,
        workOrders: true,
        inventory: false,
        invoices: true,
        reports: "Dasar",
        ai: false,
        multiBranch: false,
        exportExcel: false,
      },
      cta: "Daftar Gratis",
      popular: false,
    },
    {
      name: "BASIC",
      price: 49000,
      description: "Untuk bengkel independen yang ingin manajemen stok dan kasir teratur.",
      staffLimit: "Hingga 3 Staf",
      woLimit: "Tanpa Batas",
      features: {
        booking: true,
        workOrders: true,
        inventory: true,
        invoices: true,
        reports: "Standar",
        ai: false,
        multiBranch: false,
        exportExcel: true,
      },
      cta: "Pilih Paket Basic",
      popular: false,
    },
    {
      name: "PRO",
      price: 99000,
      description: "Paket paling diminati untuk bengkel modern dengan tim teknisi aktif.",
      staffLimit: "Hingga 10 Staf",
      woLimit: "Tanpa Batas",
      features: {
        booking: true,
        workOrders: true,
        inventory: true,
        invoices: true,
        reports: "Lengkap (Laba/Rugi)",
        ai: true,
        multiBranch: false,
        exportExcel: true,
      },
      cta: "Pilih Paket Pro",
      popular: true,
    },
    {
      name: "BUSINESS",
      price: 199000,
      description: "Solusi enterprise untuk jaringan bengkel dengan banyak cabang.",
      staffLimit: "Hingga 25 Staf",
      woLimit: "Tanpa Batas",
      features: {
        booking: true,
        workOrders: true,
        inventory: true,
        invoices: true,
        reports: "Konsolidasian Cabang",
        ai: true,
        multiBranch: true,
        exportExcel: true,
      },
      cta: "Pilih Business",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-bengkel-bg flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-bengkel-orange uppercase tracking-wider">Investasi Bisnis Bengkel</span>
          <h1 className="text-4xl font-black text-bengkel-navy tracking-tight">
            Paket Berlangganan Fleksibel & Terjangkau
          </h1>
          <p className="text-base text-bengkel-muted">
            Semua paket mendukung pencatatan transaksi nyata, multi-tenant RLS, dan mata uang Rupiah tanpa biaya tersembunyi.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                tier.popular
                  ? "bg-bengkel-navy text-white border-2 border-bengkel-orange shadow-xl relative scale-105 z-10"
                  : "bg-white text-bengkel-text border border-bengkel-border shadow-xs"
              }`}
            >
              <div>
                {tier.popular && (
                  <div className="inline-block px-3 py-1 bg-bengkel-orange text-white text-[10px] font-bold uppercase rounded-full mb-3 tracking-wider">
                    Pilihan Utama
                  </div>
                )}
                <h3 className={`text-xl font-black tracking-tight ${tier.popular ? "text-white" : "text-bengkel-navy"}`}>
                  {tier.name}
                </h3>
                <p className={`text-xs mt-1 min-h-[36px] ${tier.popular ? "text-gray-300" : "text-bengkel-muted"}`}>
                  {tier.description}
                </p>

                <div className="my-6">
                  <div className="text-3xl font-black">
                    {tier.price === 0 ? "Gratis" : formatRupiah(tier.price)}
                  </div>
                  <div className={`text-[11px] ${tier.popular ? "text-gray-400" : "text-bengkel-muted"}`}>
                    {tier.price === 0 ? "Tanpa batas waktu" : "per bulan"}
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-gray-100/20 text-xs">
                  <div className="font-semibold">{tier.staffLimit}</div>
                  <div className="font-semibold">{tier.woLimit}</div>
                  <div className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${tier.popular ? "text-bengkel-orange" : "text-bengkel-green"}`} />
                    <span>Booking Online Publik</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${tier.popular ? "text-bengkel-orange" : "text-bengkel-green"}`} />
                    <span>SPK & Faktur Kasir</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tier.features.inventory ? (
                      <Check className={`w-4 h-4 ${tier.popular ? "text-bengkel-orange" : "text-bengkel-green"}`} />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span>Manajemen Stok Spare Part</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tier.features.ai ? (
                      <Check className={`w-4 h-4 ${tier.popular ? "text-bengkel-orange" : "text-bengkel-green"}`} />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span>Asisten AI Gemini Terintegrasi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tier.features.multiBranch ? (
                      <Check className={`w-4 h-4 ${tier.popular ? "text-bengkel-orange" : "text-bengkel-green"}`} />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span>Multi-Cabang Bengkel</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/register-workshop"
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                    tier.popular
                      ? "bg-bengkel-orange hover:bg-bengkel-orange-hover text-white shadow-md shadow-orange-500/25"
                      : "bg-bengkel-navy text-white hover:bg-bengkel-navy-light"
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
