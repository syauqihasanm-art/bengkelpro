"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import {
  Search,
  DollarSign,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  QrCode,
  Plus,
  FileText,
  ShoppingBag,
  Download,
  Eye,
  Wrench,
} from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createTab, setCreateTab] = useState<"from_wo" | "direct">("from_wo");

  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [reviewWO, setReviewWO] = useState<any | null>(null);
  const [qrisGatewayConfigured, setQrisGatewayConfigured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");

  // Auxiliary data for creating invoices
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Form states
  const [selectedWOId, setSelectedWOId] = useState("");
  const [directSaleForm, setDirectSaleForm] = useState({
    customerId: "",
    items: [
      {
        itemType: "part" as "service" | "part",
        name: "",
        quantity: 1,
        unitPrice: 0,
        referenceId: "",
      },
    ],
    discount: 0,
    tax: 0,
    notes: "Penjualan langsung kasir",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: "cash" as "cash" | "bank_transfer" | "qris" | "other",
    notes: "Pembayaran lunas di kasir",
    externalReference: "",
    qrisConfirmed: false,
  });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", { cache: "no-store" });
      const data = await res.json();
      setInvoices(data.invoices || []);
      setQrisGatewayConfigured(Boolean(data.qrisGatewayConfigured));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuxData = useCallback(async () => {
    try {
      const [woRes, custRes, prodRes] = await Promise.all([
        fetch("/api/work-orders", { cache: "no-store" }),
        fetch("/api/customers", { cache: "no-store" }),
        fetch("/api/inventory", { cache: "no-store" }),
      ]);
      const woData = await woRes.json();
      const custData = await custRes.json();
      const prodData = await prodRes.json();

      setWorkOrders(woData.workOrders || []);
      setCustomers(custData.customers || []);
      setProducts(prodData.products || []);

      if (custData.customers?.length > 0 && !directSaleForm.customerId) {
        setDirectSaleForm((prev) => ({ ...prev, customerId: custData.customers[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  }, [directSaleForm.customerId]);

  const openPaymentModal = useCallback((invoice: any) => {
    setError("");
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: Math.max(0, invoice.totalAmount - invoice.paidAmount),
      paymentMethod: "cash",
      notes: "Pembayaran kasir",
      externalReference: "",
      qrisConfirmed: false,
    });
    setPaymentModalOpen(true);
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchAuxData();
  }, [fetchInvoices, fetchAuxData]);

  useEffect(() => {
    if (typeof window === "undefined" || invoices.length === 0) return;
    const invId = new URLSearchParams(window.location.search).get("invoiceId");
    if (invId) {
      const target = invoices.find((i) => i.id === invId && i.status !== "paid");
      if (target) {
        openPaymentModal(target);
      }
    }
  }, [invoices, openPaymentModal]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setError("");

    if (
      (paymentForm.paymentMethod === "qris" || paymentForm.paymentMethod === "bank_transfer") &&
      !paymentForm.externalReference.trim()
    ) {
      setError("Masukkan Nomor Referensi / RRN bukti mutasi QRIS atau Transfer Bank terlebih dahulu.");
      return;
    }

    if (paymentForm.paymentMethod === "qris" && !paymentForm.qrisConfirmed) {
      setError("Centang konfirmasi bahwa dana QRIS benar-benar telah diterima di mutasi merchant.");
      return;
    }

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
          externalReference: paymentForm.externalReference.trim() || undefined,
          qrisConfirmed: paymentForm.paymentMethod === "qris" ? paymentForm.qrisConfirmed : true,
          verifiedBy: userName,
          idempotencyKey: `PAY-MANUAL-${Date.now()}-${selectedInvoice.id.slice(0, 8)}`,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mencatat pembayaran.");

      setNotification(
        `Pembayaran faktur #${selectedInvoice.invoiceNumber} sebesar ${formatRupiah(paymentForm.amount)} Lunas! Dashboard Owner & riwayat pelanggan otomatis diperbarui.`
      );
      setTimeout(() => setNotification(null), 5000);

      setPaymentModalOpen(false);
      await Promise.all([fetchInvoices(), fetchAuxData()]);
    } catch (err: any) {
      setError(err.message || "Gagal mencatat pembayaran.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickCreateFromWO = async (woId: string, autoOpenPay = true) => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", workOrderId: woId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menerbitkan faktur SPK.");
      setNotification(`Faktur #${json.invoice?.invoiceNumber} berhasil diterbitkan! Silakan konfirmasi pembayaran kasir.`);
      setTimeout(() => setNotification(null), 5000);
      await Promise.all([fetchInvoices(), fetchAuxData()]);
      setReviewWO(null);
      if (autoOpenPay && json.invoice && json.invoice.status !== "paid") {
        openPaymentModal(json.invoice);
      }
    } catch (err: any) {
      setError(err.message || "Gagal menerbitkan faktur.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = (invoice: any) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(16, 29, 53);
    doc.text("BENGKEL SAHABAT MOTOR - BENGKELPRO", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Jl. Fatmawati Raya No. 45, Jakarta Selatan | Telp: 0812-3456-7890", 14, 24);
    doc.text(`No. Faktur: ${invoice.invoiceNumber}   |   Tanggal: ${formatIndonesianDate(invoice.invoiceDate)}`, 14, 34);
    doc.text(`Pelanggan: ${invoice.customerName || "Pelanggan"}   |   Status: ${invoice.status === "paid" ? "LUNAS" : "BELUM LUNAS"}`, 14, 40);

    autoTable(doc, {
      startY: 48,
      head: [["Deskripsi Layanan / Suku Cadang", "Qty", "Harga Satuan", "Subtotal"]],
      body: (invoice.items || []).map((it: any) => [
        `[${it.itemType === "service" ? "JASA" : "PART"}] ${it.name}`,
        String(it.quantity),
        formatRupiah(it.unitPrice),
        formatRupiah(it.totalPrice),
      ]),
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 90;
    doc.setFontSize(11);
    doc.setTextColor(16, 29, 53);
    doc.text(`Total Tagihan: ${formatRupiah(invoice.totalAmount)}`, 14, finalY + 12);
    doc.text(`Sudah Dibayar: ${formatRupiah(invoice.paidAmount)}`, 14, finalY + 18);
    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  const handleCreateFromWO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWOId) {
      setError("Pilih SPK yang akan diterbitkan fakturnya.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          workOrderId: selectedWOId,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menerbitkan faktur SPK.");

      setNotification(`Faktur #${json.invoice?.invoiceNumber} berhasil diterbitkan dari SPK!`);
      setTimeout(() => setNotification(null), 4000);

      setCreateModalOpen(false);
      setSelectedWOId("");
      await Promise.all([fetchInvoices(), fetchAuxData()]);
    } catch (err: any) {
      setError(err.message || "Gagal menerbitkan faktur SPK.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateDirectSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directSaleForm.customerId) {
      setError("Pilih pelanggan terlebih dahulu.");
      return;
    }
    if (directSaleForm.items.length === 0 || !directSaleForm.items[0].name) {
      setError("Tambahkan minimal satu item barang atau jasa.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const selectedCustomer = customers.find((c) => c.id === directSaleForm.customerId);
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          customerId: directSaleForm.customerId,
          customerName: selectedCustomer?.fullName,
          items: directSaleForm.items,
          discount: directSaleForm.discount,
          tax: directSaleForm.tax,
          notes: directSaleForm.notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat transaksi kasir langsung.");

      setNotification(`Transaksi penjualan langsung #${json.invoice?.invoiceNumber} berhasil dibuat!`);
      setTimeout(() => setNotification(null), 4000);

      setCreateModalOpen(false);
      setDirectSaleForm({
        customerId: customers[0]?.id || "",
        items: [
          {
            itemType: "part",
            name: "",
            quantity: 1,
            unitPrice: 0,
            referenceId: "",
          },
        ],
        discount: 0,
        tax: 0,
        notes: "Penjualan langsung kasir",
      });
      fetchInvoices();
    } catch (err: any) {
      setError(err.message || "Gagal membuat transaksi kasir.");
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
              <h2>FAKTUR SERVIS & PENJUALAN</h2>
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

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "paid"
        ? inv.status === "paid"
        : inv.status !== "paid";
    return matchesSearch && matchesStatus;
  });

  // Work orders completed by mechanic & ready for invoice creation
  const workDoneWOs = workOrders.filter(
    (wo) => wo.status === "work_done" && !invoices.some((inv) => inv.workOrderId === wo.id)
  );
  // All eligible work orders without invoices
  const unbilledWOs = workOrders.filter(
    (wo) => wo.status !== "cancelled" && !invoices.some((inv) => inv.workOrderId === wo.id)
  );

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
          {notification && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{notification}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nomor faktur / pelanggan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                />
              </div>

              <div className="flex items-center gap-1">
                {(["all", "unpaid", "paid"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      statusFilter === s
                        ? "bg-bengkel-navy text-white"
                        : "bg-gray-100 text-bengkel-text hover:bg-gray-200"
                    }`}
                  >
                    {s === "all" ? "Semua" : s === "unpaid" ? "Belum Lunas" : "Lunas"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setError("");
                setCreateModalOpen(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Faktur / Transaksi Kasir</span>
            </button>
          </div>

          {/* Mechanic Finished Jobs Waiting for Billing & Invoice Creation */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-bengkel-navy flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-bengkel-orange" />
                  <span>Antrean Selesai Mekanik — Siap Dibuatkan Invoice ({workDoneWOs.length})</span>
                </h3>
                <p className="text-xs text-bengkel-muted">
                  Pekerjaan yang baru ditandai Selesai oleh mekanik otomatis masuk ke daftar ini untuk diperiksa dan diterbitkan invoice
                </p>
              </div>
            </div>

            {workDoneWOs.length === 0 ? (
              <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-xs text-bengkel-muted text-center">
                Belum ada pekerjaan baru berstatus Selesai Dikerjakan yang menunggu pembuatan invoice.
              </div>
            ) : (
              <div className="space-y-2.5">
                {workDoneWOs.map((wo) => (
                  <div
                    key={wo.id}
                    data-testid={`unbilled-work-done-${wo.workOrderNumber}`}
                    className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-200/80 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-bengkel-navy bg-white px-2 py-0.5 rounded border border-gray-200">
                          {wo.workOrderNumber}
                        </span>
                        <span className="font-bold text-bengkel-navy">
                          {wo.customer?.fullName} • {wo.vehicle?.brand} {wo.vehicle?.model} ({wo.vehicle?.licensePlate})
                        </span>
                        <Badge status={wo.status} size="sm" />
                      </div>
                      <div className="text-[11px] text-bengkel-muted">
                        Mekanik: <strong className="text-bengkel-navy">{wo.completedByMechanicName || wo.assignedMechanics?.[0]?.name || "-"}</strong> •{" "}
                        Jasa: {formatRupiah(wo.totalLabor)} • Sparepart: {formatRupiah(wo.totalParts)} •{" "}
                        <strong className="text-bengkel-orange">Total Tagihan: {formatRupiah(wo.grandTotal)}</strong>
                      </div>
                      {(wo.workResult || wo.inspectionFindings) && (
                        <div className="text-[11px] text-bengkel-text">
                          Hasil Pemeriksaan / Perbaikan: {wo.workResult || wo.inspectionFindings}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewWO(wo)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-bengkel-navy font-bold text-xs hover:bg-gray-100 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-bengkel-orange" />
                        <span>Detail Pekerjaan</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickCreateFromWO(wo.id, true)}
                        disabled={submitting}
                        data-testid={`create-invoice-${wo.workOrderNumber}`}
                        className="px-3.5 py-1.5 rounded-lg bg-bengkel-orange hover:bg-bengkel-orange-hover text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        Buat Invoice &amp; Bayar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                        Tidak ada faktur yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-bengkel-navy">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-bengkel-navy">{inv.customerName}</div>
                          {inv.workOrder && (
                            <div className="text-[10px] text-bengkel-muted font-mono">
                              {inv.workOrder.workOrderNumber}
                              {inv.vehicle ? ` • ${inv.vehicle.licensePlate}` : ""}
                            </div>
                          )}
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
                            {inv.workOrder && (
                              <button
                                onClick={() => setReviewWO(inv.workOrder)}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-bengkel-navy transition-colors"
                                title="Lihat Detail SPK & Hasil Mekanik"
                              >
                                <Eye className="w-4 h-4 text-bengkel-orange" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDownloadPDF(inv)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                              title="Download Invoice PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
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
                                data-testid={`pay-invoice-${inv.invoiceNumber}`}
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

          {/* Modal Catat Pembayaran Kasir */}
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

                  {paymentForm.paymentMethod === "qris" && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] space-y-2 text-bengkel-navy">
                      <div className="flex items-center gap-1.5 font-bold">
                        <QrCode className="w-4 h-4 text-blue-600" />
                        <span>
                          {qrisGatewayConfigured
                            ? "Gateway Midtrans QRIS Aktif"
                            : "QRIS Statis Merchant (Verifikasi Kasir)"}
                        </span>
                      </div>
                      <p className="text-bengkel-muted">
                        Minta pelanggan scan QRIS Sahabat Motor sebesar <b>{formatRupiah(paymentForm.amount)}</b>, lalu cek mutasi dana masuk dan masukkan RRN / Ref transaksi.
                      </p>
                      <input
                        type="text"
                        required
                        value={paymentForm.externalReference}
                        onChange={(e) => setPaymentForm({ ...paymentForm, externalReference: e.target.value })}
                        placeholder="Nomor Referensi / RRN QRIS *"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white text-xs"
                      />
                      <label className="flex items-start gap-2 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={paymentForm.qrisConfirmed}
                          onChange={(e) => setPaymentForm({ ...paymentForm, qrisConfirmed: e.target.checked })}
                          className="mt-0.5"
                        />
                        <span>Saya pastikan dana QRIS sudah terkonfirmasi masuk ke rekening/mutasi merchant.</span>
                      </label>
                    </div>
                  )}

                  {paymentForm.paymentMethod === "bank_transfer" && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] space-y-2 text-bengkel-navy">
                      <div className="font-bold">Transfer Bank — Rekening Sahabat Motor</div>
                      <p className="text-bengkel-muted">
                        Verifikasi bukti transfer pelanggan dan masukkan nomor referensi mutasi sebelum konfirmasi lunas.
                      </p>
                      <input
                        type="text"
                        required
                        value={paymentForm.externalReference}
                        onChange={(e) => setPaymentForm({ ...paymentForm, externalReference: e.target.value })}
                        placeholder="No. Referensi / Kode Mutasi Transfer *"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-xs"
                      />
                    </div>
                  )}

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

          {/* Modal Detail Pekerjaan Mekanik (SPK) untuk Review Kasir */}
          {reviewWO && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-bengkel-border space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-bengkel-navy">{reviewWO.workOrderNumber}</span>
                      <Badge status={reviewWO.invoiceStatus === "paid" || reviewWO.paidAt ? "paid" : reviewWO.status} size="sm" />
                    </div>
                    <p className="text-xs text-bengkel-muted mt-0.5">
                      Pemeriksaan Akhir Kasir — Jasa Servis &amp; Suku Cadang
                    </p>
                  </div>
                  <button onClick={() => setReviewWO(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                  <div>
                    <div className="text-bengkel-muted">Pelanggan</div>
                    <div className="font-bold text-bengkel-navy">{reviewWO.customer?.fullName || "-"}</div>
                  </div>
                  <div>
                    <div className="text-bengkel-muted">Kendaraan</div>
                    <div className="font-bold text-bengkel-navy">
                      {reviewWO.vehicle?.brand} {reviewWO.vehicle?.model} ({reviewWO.vehicle?.licensePlate})
                    </div>
                  </div>
                  <div>
                    <div className="text-bengkel-muted">Mekanik Pelaksana</div>
                    <div className="font-bold text-bengkel-orange">
                      {reviewWO.completedByMechanicName || reviewWO.assignedMechanics?.[0]?.name || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-bengkel-muted">Keluhan Awal</div>
                    <div className="text-bengkel-text">{reviewWO.customerComplaint}</div>
                  </div>
                  {(reviewWO.inspectionFindings || reviewWO.workResult || reviewWO.finalNotes) && (
                    <div className="col-span-2 pt-2 border-t border-gray-200">
                      <div className="font-bold text-bengkel-navy">Hasil Pemeriksaan &amp; Perbaikan Mekanik:</div>
                      <div className="text-bengkel-text mt-0.5">
                        {reviewWO.workResult || reviewWO.finalNotes || reviewWO.inspectionFindings}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border border-bengkel-border rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-bengkel-border font-bold text-bengkel-muted">
                      <tr>
                        <th className="py-2 px-3">Jasa / Sparepart</th>
                        <th className="py-2 px-3 text-right">Qty</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(reviewWO.items || []).map((it: any, i: number) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-medium text-bengkel-navy">
                            [{it.itemType === "service" ? "JASA" : "PART"}] {it.name}
                          </td>
                          <td className="py-2 px-3 text-right">{it.quantity}</td>
                          <td className="py-2 px-3 text-right font-bold">{formatRupiah(it.totalPrice || it.quantity * it.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                  <div>
                    Jasa: <b>{formatRupiah(reviewWO.totalLabor)}</b> • Sparepart: <b>{formatRupiah(reviewWO.totalParts)}</b>
                  </div>
                  <div className="text-sm font-black text-bengkel-orange">
                    Total: {formatRupiah(reviewWO.grandTotal)}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setReviewWO(null)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-bold text-bengkel-text hover:bg-gray-50"
                  >
                    Tutup
                  </button>
                  {reviewWO.status === "work_done" && (
                    <button
                      type="button"
                      onClick={() => handleQuickCreateFromWO(reviewWO.id, true)}
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-bengkel-orange hover:bg-bengkel-orange-hover text-white text-xs font-bold shadow-xs"
                    >
                      Terbitkan Invoice &amp; Terima Pembayaran
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal Buat Faktur / Kasir Baru */}
          {createModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-bengkel-border space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Terbitkan Faktur Tagihan Baru</h3>
                  <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCreateTab("from_wo")}
                    className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                      createTab === "from_wo" ? "bg-white text-bengkel-navy shadow-xs" : "text-gray-600 hover:text-bengkel-navy"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-bengkel-orange" />
                    <span>Dari SPK Servis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateTab("direct")}
                    className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                      createTab === "direct" ? "bg-white text-bengkel-navy shadow-xs" : "text-gray-600 hover:text-bengkel-navy"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-bengkel-orange" />
                    <span>Penjualan Langsung</span>
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-bengkel-red flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Tab 1: Dari SPK Servis */}
                {createTab === "from_wo" && (
                  <form onSubmit={handleCreateFromWO} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Pilih SPK yang Belum Ditagihkan *
                      </label>
                      {unbilledWOs.length === 0 ? (
                        <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center text-bengkel-muted">
                          Semua SPK saat ini sudah memiliki faktur tagihan kasir.
                        </div>
                      ) : (
                        <select
                          required
                          value={selectedWOId}
                          onChange={(e) => setSelectedWOId(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                        >
                          <option value="">-- Pilih Surat Perintah Kerja --</option>
                          {unbilledWOs.map((wo) => (
                            <option key={wo.id} value={wo.id}>
                              {wo.workOrderNumber} - {wo.customer?.fullName} ({wo.vehicle?.brand} {wo.vehicle?.model}) - {formatRupiah(wo.grandTotal)}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-bengkel-navy">
                      <p className="font-semibold">Informasi:</p>
                      <p className="text-bengkel-muted mt-0.5">
                        Faktur akan secara otomatis merinci seluruh jasa teknisi dan suku cadang yang tercatat pada lembar pengerjaan SPK yang dipilih.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setCreateModalOpen(false)}
                        className="px-3.5 py-2 rounded-lg border border-gray-200 text-bengkel-text hover:bg-gray-50 font-bold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || unbilledWOs.length === 0 || !selectedWOId}
                        className="px-4 py-2 rounded-lg bg-bengkel-orange text-white hover:bg-bengkel-orange-hover font-bold shadow-xs disabled:opacity-50"
                      >
                        {submitting ? "Memproses..." : "Terbitkan Faktur SPK"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Tab 2: Penjualan Langsung */}
                {createTab === "direct" && (
                  <form onSubmit={handleCreateDirectSale} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Pelanggan Pembeli *
                      </label>
                      <select
                        required
                        value={directSaleForm.customerId}
                        onChange={(e) => setDirectSaleForm({ ...directSaleForm, customerId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullName} ({c.phone})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-bengkel-text uppercase tracking-wider">
                          Daftar Barang / Sparepart / Jasa *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setDirectSaleForm({
                              ...directSaleForm,
                              items: [
                                ...directSaleForm.items,
                                {
                                  itemType: "part",
                                  name: "",
                                  quantity: 1,
                                  unitPrice: 0,
                                  referenceId: "",
                                },
                              ],
                            });
                          }}
                          className="text-[11px] font-bold text-bengkel-orange hover:text-bengkel-orange-hover"
                        >
                          + Tambah Item
                        </button>
                      </div>

                      {directSaleForm.items.map((it, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={it.referenceId || ""}
                              onChange={(e) => {
                                const prod = products.find((p) => p.id === e.target.value);
                                const newItems = [...directSaleForm.items];
                                if (prod) {
                                  newItems[idx] = {
                                    ...newItems[idx],
                                    referenceId: prod.id,
                                    name: prod.name,
                                    unitPrice: prod.sellingPrice,
                                    itemType: "part",
                                  };
                                } else {
                                  newItems[idx] = {
                                    ...newItems[idx],
                                    referenceId: "",
                                  };
                                }
                                setDirectSaleForm({ ...directSaleForm, items: newItems });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg border border-bengkel-border text-xs bg-white"
                            >
                              <option value="">-- Pilih dari Stok Inventaris atau Ketik Manual --</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (Stok: {p.stockQuantity}) - {formatRupiah(p.sellingPrice)}
                                </option>
                              ))}
                            </select>

                            {directSaleForm.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = directSaleForm.items.filter((_, i) => i !== idx);
                                  setDirectSaleForm({ ...directSaleForm, items: newItems });
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Nama Barang / Jasa"
                              required
                              value={it.name}
                              onChange={(e) => {
                                const newItems = [...directSaleForm.items];
                                newItems[idx].name = e.target.value;
                                setDirectSaleForm({ ...directSaleForm, items: newItems });
                              }}
                              className="col-span-1 px-2 py-1.5 rounded-lg border border-bengkel-border text-xs bg-white"
                            />
                            <input
                              type="number"
                              placeholder="Qty"
                              required
                              min={1}
                              value={it.quantity}
                              onChange={(e) => {
                                const newItems = [...directSaleForm.items];
                                newItems[idx].quantity = parseInt(e.target.value) || 1;
                                setDirectSaleForm({ ...directSaleForm, items: newItems });
                              }}
                              className="col-span-1 px-2 py-1.5 rounded-lg border border-bengkel-border text-xs text-right bg-white"
                            />
                            <input
                              type="number"
                              placeholder="Harga Satuan"
                              required
                              min={0}
                              value={it.unitPrice}
                              onChange={(e) => {
                                const newItems = [...directSaleForm.items];
                                newItems[idx].unitPrice = parseInt(e.target.value) || 0;
                                setDirectSaleForm({ ...directSaleForm, items: newItems });
                              }}
                              className="col-span-1 px-2 py-1.5 rounded-lg border border-bengkel-border text-xs text-right bg-white font-bold"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                          Diskon (Rp)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={directSaleForm.discount}
                          onChange={(e) => setDirectSaleForm({ ...directSaleForm, discount: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs text-right"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                          Catatan
                        </label>
                        <input
                          type="text"
                          value={directSaleForm.notes}
                          onChange={(e) => setDirectSaleForm({ ...directSaleForm, notes: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setCreateModalOpen(false)}
                        className="px-3.5 py-2 rounded-lg border border-gray-200 text-bengkel-text hover:bg-gray-50 font-bold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 rounded-lg bg-bengkel-orange text-white hover:bg-bengkel-orange-hover font-bold shadow-xs"
                      >
                        {submitting ? "Memproses..." : "Simpan & Buat Faktur"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
