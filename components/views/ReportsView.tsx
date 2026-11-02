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
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";
import * as XLSX from "xlsx";

export interface ReportsViewProps {
  role?: "workshop_owner" | "workshop_admin";
  userName?: string;
}

export function ReportsView({
  role = "workshop_owner",
  userName = "Budi Santoso",
}: ReportsViewProps) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => setSummary(data.summary))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportExcel = () => {
    if (!summary) return;

    const data = [
      ["LAPORAN FINANSIAL & LABA RUGI BENGKELPRO"],
      ["Bengkel: Sahabat Motor"],
      ["Periode: " + formatIndonesianDate(new Date())],
      [""],
      ["No", "Komponen Finansial", "Nominal (IDR)", "Keterangan"],
      [1, "Pendapatan Jasa Servis & Perbaikan", summary.serviceRevenue || 0, "Dari ongkos pengerjaan mekanik"],
      [2, "Pendapatan Suku Cadang (Spare Part)", summary.partsRevenue || 0, "Penjualan part melalui SPK"],
      ["", "TOTAL OMZET KASIR (REVENUE)", summary.totalRevenue || 0, "Penerimaan kas lunas"],
      ["", "", "", ""],
      [3, "Harga Pokok Penjualan Suku Cadang (COGS)", summary.cogs || 0, "Modal pokok suku cadang terpakai"],
      ["", "LABA KOTOR (GROSS PROFIT)", summary.grossProfit || 0, "Omzet dikurangi HPP Part"],
      ["", "", "", ""],
      [4, "Beban Operasional Bengkel", summary.totalExpenses || 0, "Biaya listrik, air, gaji, perlengkapan"],
      ["", "LABA BERSIH OPERASIONAL (NET PROFIT)", summary.netProfit || 0, "Keuntungan bersih bengkel"],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws["!cols"] = [
      { wch: 6 },
      { wch: 42 },
      { wch: 22 },
      { wch: 40 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Rekonsiliasi Laba Rugi");
    XLSX.writeFile(wb, `Laporan_Keuangan_BengkelPro_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

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

  const handlePrintReport = () => {
    if (!summary) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Finansial - Bengkel Sahabat Motor</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #101d35; }
            .header { border-bottom: 2px solid #101d35; padding-bottom: 12px; margin-bottom: 24px; }
            .brand { font-size: 24px; font-weight: 800; color: #ff5722; }
            .sub { font-size: 13px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: left; }
            th { background: #f8fafc; font-weight: 700; }
            .total-row { font-weight: bold; background: #f1f5f9; }
            .profit-row { font-weight: 900; font-size: 15px; background: #ecfdf5; color: #047857; border-top: 2px solid #047857; }
            .text-right { text-align: right; }
            .footer { margin-top: 40px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">BengkelPro — Sahabat Motor</div>
            <div class="sub">Jl. Fatmawati Raya No. 45, Jakarta Selatan | Telp: 0812-3456-7890</div>
            <div style="margin-top: 8px; font-weight: 600; font-size: 15px;">LAPORAN REKONSILIASI LABA & RUGI OPERASIONAL</div>
            <div class="sub">Periode Cetak: ${formatIndonesianDate(new Date())}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Komponen Finansial</th>
                <th>Keterangan Operasional</th>
                <th class="text-right">Nominal (IDR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. Pendapatan Jasa Servis</strong></td>
                <td>Pengerjaan mekanik & perbaikan motor/mobil</td>
                <td class="text-right">${formatRupiah(summary.serviceRevenue || 0)}</td>
              </tr>
              <tr>
                <td><strong>2. Penjualan Suku Cadang</strong></td>
                <td>Oli, spare part, dan aksesoris terpasang</td>
                <td class="text-right">${formatRupiah(summary.partsRevenue || 0)}</td>
              </tr>
              <tr class="total-row">
                <td><strong>TOTAL OMZET (PENERIMAAN KASIR)</strong></td>
                <td>Penerimaan kas lunas</td>
                <td class="text-right"><strong>${formatRupiah(summary.totalRevenue || 0)}</strong></td>
              </tr>
              <tr>
                <td><strong>3. HPP Suku Cadang (COGS)</strong></td>
                <td>Biaya modal suku cadang yang dikeluarkan</td>
                <td class="text-right" style="color: #dc2626;">(${formatRupiah(summary.cogs || 0)})</td>
              </tr>
              <tr class="total-row" style="background: #fff7ed; color: #c2410c;">
                <td><strong>LABA KOTOR (GROSS PROFIT)</strong></td>
                <td>Omzet dikurangi modal pokok barang</td>
                <td class="text-right"><strong>${formatRupiah(summary.grossProfit || 0)}</strong></td>
              </tr>
              <tr>
                <td><strong>4. Beban Operasional Umum</strong></td>
                <td>Listrik, air, gaji staf, perlengkapan bengkel</td>
                <td class="text-right" style="color: #dc2626;">(${formatRupiah(summary.totalExpenses || 0)})</td>
              </tr>
              <tr class="profit-row">
                <td>ESTIMASI LABA BERSIH (NET PROFIT)</td>
                <td>Laba bersih sesudah seluruh beban operasional</td>
                <td class="text-right">${formatRupiah(summary.netProfit || 0)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <span>Dicetak secara otomatis oleh sistem BengkelPro</span>
            <span>Penanggung Jawab: ${userName}</span>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role={role} userName={userName} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Laporan Finansial & Laba Bersih"
          subtitle="Rekonsiliasi omzet, harga pokok penjualan part, dan beban operasional nyata"
          currentRole={role}
          userName={userName}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-bengkel-navy">
              <Calendar className="w-4 h-4 text-bengkel-orange" />
              <span>Periode Buku: Bulan Berjalan (Oktober - November 2026)</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportExcel}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow-xs transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel (.xlsx)</span>
              </button>

              <button
                onClick={handlePrintReport}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-bengkel-navy text-white text-xs font-bold hover:bg-bengkel-navy-light shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / PDF</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 text-bengkel-text text-xs font-bold hover:bg-gray-50 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
            </div>
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
