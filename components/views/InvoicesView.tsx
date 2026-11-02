"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { Receipt, Search, DollarSign, Printer, CheckCircle2, AlertCircle, X, QrCode } from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export interface InvoicesViewProps {
  role?: "workshop_owner" | "workshop_admin";
  userName?: string;
}

export function InvoicesView({
  role = "workshop_owner",
  userName = "Budi Santoso",
}: InvoicesViewProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: "cash" as "cash" | "bank_transfer" | "qris" | "other",
    notes: "Pembayaran lunas di kasir",
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openPaymentModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.totalAmount - invoice.paidAmount,
      paymentMethod: "cash",
      notes: "Pembayaran kasir",
    });
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: paymentForm.amount,
          paymentMethod: paymentForm.paymentMethod,
          notes: paymentForm.notes,
          idempotencyKey: `PAY-MANUAL-${Date.now()}-${selectedInvoice.id.slice(0, 8)}`,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mencatat pembayaran.");

      setPaymentModalOpen(false);
      fetchInvoices();
    } catch (err: any) {
      setError(err.message || "Gagal mencatat pembayaran.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (invoice: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Faktur ${invoice.invoiceNumber} - BengkelPro</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #101d35; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #101d35; padding-bottom: 12px; }
            .title { font-size: 24px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { padding: 8px 12px; border-bottom: 1px solid #ddd; text-align: left; }
            th { background: #f5f7fa; }
            .text-right { text-align: right; }
            .totals { margin-top: 20px; float: right; width: 300px; font-size: 14px; }
            .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
            .grand-total { font-weight: bold; font-size: 16px; border-top: 2px solid #101d35; padding-top: 6px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">BENGKELPRO</div>
              <div>Bengkel Sahabat Motor</div>
              <div>Jl. Fatmawati Raya No. 45, Jakarta Selatan</div>
              <div>Telp: 0812-3456-7890</div>
            </div>
            <div style="text-align: right;">
              <h2>FAKTUR SERVIS</h2>
              <div>No: <b>${invoice.invoiceNumber}</b></div>
              <div>Tanggal: ${formatIndonesianDate(invoice.invoiceDate)}</div>
              <div>Customer: <b>${invoice.customerName}</b></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item / Jasa Servis</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Harga Satuan</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.items || []).map((it: any) => `
                <tr>
                  <td>${it.name}</td>
                  <td class="text-right">${it.quantity}</td>
                  <td class="text-right">${formatRupiah(it.unitPrice)}</td>
                  <td class="text-right">${formatRupiah(it.totalPrice)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="totals">
            <div><span>Subtotal:</span><span>${formatRupiah(invoice.subtotal)}</span></div>
            <div><span>Diskon:</span><span>${formatRupiah(invoice.discount)}</span></div>
            <div class="grand-total"><span>Total Tagihan:</span><span>${formatRupiah(invoice.totalAmount)}</span></div>
            <div><span>Sudah Dibayar:</span><span>${formatRupiah(invoice.paidAmount)}</span></div>
            <div style="color: ${invoice.status === 'paid' ? 'green' : 'red'}; font-weight: bold;">
              <span>Status:</span><span>${invoice.status.toUpperCase()}</span>
            </div>
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
          title="Faktur & Kasir Pembayaran"
          subtitle="Pencatatan tagihan servis, kasir tunai, transfer, dan QRIS"
          currentRole={role}
          userName={userName}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Invoices Table */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Nomor Faktur</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Tanggal Faktur</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Total Tagihan</th>
                    <th className="py-3 px-4 text-right">Sudah Dibayar</th>
                    <th className="py-3 px-4 text-right">Aksi Kasir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                        Memuat data faktur...
                      </td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                        Belum ada faktur tercatat.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-bengkel-navy">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-bengkel-navy">
                          {inv.customerName}
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
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePrint(inv)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                              title="Cetak Faktur"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            {inv.status !== "paid" && (
                              <button
                                onClick={() => openPaymentModal(inv)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-bengkel-orange text-white hover:bg-bengkel-orange-hover shadow-xs flex items-center gap-1"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Bayar</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Catat Pembayaran */}
          {paymentModalOpen && selectedInvoice && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Catat Pembayaran Kasir</h3>
                  <button onClick={() => setPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                  <div className="font-bold text-bengkel-navy">Faktur #{selectedInvoice.invoiceNumber}</div>
                  <div className="flex justify-between text-bengkel-muted">
                    <span>Total Tagihan:</span>
                    <span className="font-bold text-bengkel-navy">{formatRupiah(selectedInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-bengkel-muted">
                    <span>Sisa Yang Harus Dibayar:</span>
                    <span className="font-bold text-bengkel-red">
                      {formatRupiah(selectedInvoice.totalAmount - selectedInvoice.paidAmount)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-bengkel-red flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Metode Pembayaran *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: "cash", label: "Tunai" },
                        { val: "qris", label: "QRIS" },
                        { val: "bank_transfer", label: "Transfer" },
                      ].map((m) => (
                        <button
                          key={m.val}
                          type="button"
                          onClick={() => setPaymentForm({ ...paymentForm, paymentMethod: m.val as any })}
                          className={`py-2 rounded-lg border font-bold text-center ${
                            paymentForm.paymentMethod === m.val
                              ? "bg-bengkel-orange text-white border-bengkel-orange shadow-xs"
                              : "bg-white text-gray-600 border-gray-200"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nominal Pembayaran (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={selectedInvoice.totalAmount - selectedInvoice.paidAmount}
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs text-right font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Catatan Kasir
                    </label>
                    <input
                      type="text"
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setPaymentModalOpen(false)}
                      className="px-3.5 py-2 rounded-lg border border-gray-200 text-bengkel-text hover:bg-gray-50 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-bengkel-orange text-white hover:bg-bengkel-orange-hover font-bold shadow-xs"
                    >
                      {submitting ? "Memproses..." : "Konfirmasi Pembayaran"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
