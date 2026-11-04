"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { Receipt, Printer, Eye, X, CheckCircle2 } from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => setInvoices(data.invoices || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = (invoice: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Bukti Pembayaran ${invoice.invoiceNumber} - BengkelPro</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #101d35; }
            .header { border-bottom: 2px solid #101d35; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: bold; color: #ff5722; }
            .sub { font-size: 12px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { padding: 8px 12px; border-bottom: 1px solid #ddd; text-align: left; }
            th { background: #f5f7fa; font-weight: bold; }
            .text-right { text-align: right; }
            .totals { margin-top: 20px; float: right; width: 280px; font-size: 13px; }
            .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
            .grand-total { font-weight: bold; font-size: 15px; border-top: 2px solid #101d35; padding-top: 6px; }
            .status-badge { display: inline-block; padding: 4px 10px; border-radius: 99px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
            .status-paid { background: #dcfce7; color: #15803d; }
            .footer { margin-top: 80px; text-align: center; font-size: 11px; color: #888; border-top: 1px dashed #ccc; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">BENGKEL SAHABAT MOTOR</div>
            <div class="sub">Jl. Fatmawati Raya No. 45, Jakarta Selatan | Telp: 0812-3456-7890</div>
            <div style="margin-top: 8px; font-weight: bold; font-size: 14px;">FAKTUR & BUKTI PEMBAYARAN RESMI</div>
            <div class="sub">Nomor: ${invoice.invoiceNumber} | Tanggal: ${formatIndonesianDate(invoice.invoiceDate)}</div>
          </div>

          <div>
            <strong>Pelanggan:</strong> ${invoice.customerName || "Rudi Hermawan (0812-9876-5432)"}<br/>
            <strong>Kendaraan:</strong> Honda Vario 160 (B 1234 XYZ)
          </div>

          <table>
            <thead>
              <tr>
                <th>Deskripsi Layanan / Suku Cadang</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Harga Satuan</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.items || invoice.workOrder?.items || []).map((it: any) => `
                <tr>
                  <td>${it.name}</td>
                  <td class="text-right">${it.quantity}</td>
                  <td class="text-right">${formatRupiah(it.unitPrice)}</td>
                  <td class="text-right">${formatRupiah(it.totalPrice || it.unitPrice * it.quantity)}</td>
                </tr>
              `).join("") || `
                <tr>
                  <td>Servis Rutin Berkala & Ganti Oli</td>
                  <td class="text-right">1</td>
                  <td class="text-right">${formatRupiah(invoice.subtotal)}</td>
                  <td class="text-right">${formatRupiah(invoice.subtotal)}</td>
                </tr>
              `}
            </tbody>
          </table>

          <div class="totals">
            <div><span>Subtotal:</span><span>${formatRupiah(invoice.subtotal)}</span></div>
            <div><span>Diskon:</span><span>${formatRupiah(invoice.discount)}</span></div>
            <div class="grand-total"><span>Total Tagihan:</span><span>${formatRupiah(invoice.totalAmount)}</span></div>
            <div><span>Sudah Dibayar:</span><span>${formatRupiah(invoice.paidAmount)}</span></div>
            <div style="margin-top: 6px;">
              <span>Status:</span>
              <span class="status-badge status-paid">${invoice.status.toUpperCase()}</span>
            </div>
          </div>

          <div style="clear: both;"></div>

          <div class="footer">
            Terima kasih atas kepercayaan Anda merawat kendaraan di Bengkel Sahabat Motor.<br/>
            Simpan faktur ini sebagai bukti garansi resmi pengerjaan servis (7 hari garansi).
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="customer" userName="Rudi Hermawan" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Faktur & Tagihan Servis"
          subtitle="Daftar nota resmi dan bukti pembayaran bengkel"
          currentRole="customer"
        />

        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Nomor Faktur</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Total Tagihan</th>
                    <th className="py-3 px-4 text-right">Telah Dibayar</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-bengkel-muted">
                        Memuat data tagihan...
                      </td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-bengkel-muted">
                        Belum ada riwayat tagihan.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-bengkel-navy">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 text-bengkel-muted">
                          {formatIndonesianDate(inv.invoiceDate)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge status={inv.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-bengkel-navy">
                          {formatRupiah(inv.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-bengkel-green">
                          {formatRupiah(inv.paidAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handlePrint(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bengkel-orange text-white text-[11px] font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Nota</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
