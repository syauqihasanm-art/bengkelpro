"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Package,
  Wrench,
  Download,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => setSummary(data.summary))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!summary) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Kategori Finansial,Nominal (IDR)\n" +
      `Total Omzet Kasir,${summary.totalRevenue}\n` +
      `Omzet Jasa Servis,${summary.serviceRevenue}\n` +
      `Omzet Spare Part,${summary.partsRevenue}\n` +
      `HPP Suku Cadang (COGS),${summary.cogs}\n` +
      `Laba Kotor (Gross Profit),${summary.grossProfit}\n` +
      `Beban Operasional Kas,${summary.totalExpenses}\n` +
      `Laba Bersih (Net Profit),${summary.netProfit}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Keuangan_BengkelPro_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="workshop_owner" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Laporan Finansial & Laba Bersih"
          subtitle="Rekonsiliasi omzet, harga pokok penjualan part, dan beban operasional nyata"
          currentRole="workshop_owner"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-bengkel-navy">
              <Calendar className="w-4 h-4 text-bengkel-orange" />
              <span>Periode Buku: Bulan Berjalan (Oktober - November 2026)</span>
            </div>

            <button
              onClick={handleExportCSV}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-navy text-white text-xs font-bold hover:bg-bengkel-navy-light shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Laporan (CSV / Excel)</span>
            </button>
          </div>

          {/* Core Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Omzet Penerimaan Kas"
              value={formatRupiah(summary?.totalRevenue || 0)}
              description="Dari seluruh pembayaran kasir yang lunas"
              icon={<DollarSign className="w-5 h-5" />}
              variant="green"
            />
            <StatsCard
              title="HPP Suku Cadang Terpakai"
              value={formatRupiah(summary?.cogs || 0)}
              description="Modal pokok part yang keluar di SPK"
              icon={<Package className="w-5 h-5" />}
              variant="navy"
            />
            <StatsCard
              title="Laba Kotor (Gross Profit)"
              value={formatRupiah(summary?.grossProfit || 0)}
              description="Omzet dikurangi HPP suku cadang"
              icon={<TrendingUp className="w-5 h-5" />}
              variant="orange"
            />
            <StatsCard
              title="Laba Bersih Riil (Net Profit)"
              value={formatRupiah(summary?.netProfit || 0)}
              description="Setelah seluruh pengeluaran operasional"
              icon={<CheckCircle2 className="w-5 h-5" />}
              variant="green"
            />
          </div>

          {/* Financial Reconciliation Table */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs p-6 space-y-4">
            <h3 className="text-base font-black text-bengkel-navy border-b border-gray-100 pb-3">
              Tabel Rekonsiliasi Laba Rugi Bengkel
            </h3>

            <div className="divide-y divide-gray-100 text-xs">
              <div className="py-2.5 flex justify-between font-bold text-bengkel-navy">
                <span>1. PENDAPATAN OPERASIONAL</span>
                <span></span>
              </div>
              <div className="py-2 pl-4 flex justify-between text-bengkel-muted">
                <span>• Pendapatan Jasa Servis & Perbaikan</span>
                <span className="font-semibold text-bengkel-text">{formatRupiah(summary?.serviceRevenue || 0)}</span>
              </div>
              <div className="py-2 pl-4 flex justify-between text-bengkel-muted">
                <span>• Penjualan Suku Cadang / Spare Part</span>
                <span className="font-semibold text-bengkel-text">{formatRupiah(summary?.partsRevenue || 0)}</span>
              </div>
              <div className="py-2.5 flex justify-between font-bold text-bengkel-green bg-emerald-50/50 px-2 rounded-lg">
                <span>Total Omzet Pendapatan</span>
                <span>{formatRupiah(summary?.totalRevenue || 0)}</span>
              </div>

              <div className="py-2.5 flex justify-between font-bold text-bengkel-navy pt-4">
                <span>2. HARGA POKOK PENJUALAN (HPP)</span>
                <span></span>
              </div>
              <div className="py-2 pl-4 flex justify-between text-bengkel-muted">
                <span>• Biaya Pengadaan Suku Cadang Terpakai (COGS)</span>
                <span className="font-semibold text-bengkel-red">({formatRupiah(summary?.cogs || 0)})</span>
              </div>
              <div className="py-2.5 flex justify-between font-bold text-bengkel-navy bg-orange-50/50 px-2 rounded-lg">
                <span>LABA KOTOR (GROSS PROFIT)</span>
                <span className="text-bengkel-orange">{formatRupiah(summary?.grossProfit || 0)}</span>
              </div>

              <div className="py-2.5 flex justify-between font-bold text-bengkel-navy pt-4">
                <span>3. BIAYA OPERASIONAL BENGKEL</span>
                <span></span>
              </div>
              <div className="py-2 pl-4 flex justify-between text-bengkel-muted">
                <span>• Beban Listrik, Air, Gaji, Perlengkapan & Umum</span>
                <span className="font-semibold text-bengkel-red">({formatRupiah(summary?.totalExpenses || 0)})</span>
              </div>

              <div className="py-3 flex justify-between font-black text-sm text-bengkel-navy bg-emerald-100/60 px-3 rounded-xl mt-2 border border-emerald-300">
                <span>ESTIMASI LABA BERSIH (NET PROFIT)</span>
                <span className="text-bengkel-green">{formatRupiah(summary?.netProfit || 0)}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
