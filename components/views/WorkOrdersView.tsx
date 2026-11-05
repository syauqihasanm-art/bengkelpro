"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import {
  Wrench,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Car,
  DollarSign,
  Package,
  X,
  Play,
  Check,
  ChevronRight,
  Eye,
  Printer,
} from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export interface WorkOrdersViewProps {
  role?: "workshop_owner" | "workshop_admin";
  userName?: string;
}

export function WorkOrdersView({
  role = "workshop_owner",
  userName = "Budi Santoso",
}: WorkOrdersViewProps) {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedWO, setSelectedWO] = useState<any | null>(null);

  // Form states for creating new work order
  const [formData, setFormData] = useState({
    customerId: "",
    vehicleId: "",
    odometerIn: 15000,
    customerComplaint: "",
    inspectionFindings: "",
    status: "waiting",
    items: [
      {
        itemType: "service",
        name: "Tune-up & Servis Ringan",
        quantity: 1,
        unitPrice: 75000,
        isApproved: true,
      },
    ],
    discount: 0,
    tax: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [woRes, custRes, vehRes, prodRes] = await Promise.all([
        fetch("/api/work-orders"),
        fetch("/api/customers"),
        fetch("/api/vehicles"),
        fetch("/api/inventory"),
      ]);

      const woData = await woRes.json();
      const custData = await custRes.json();
      const vehData = await vehRes.json();
      const prodData = await prodRes.json();

      setWorkOrders(woData.workOrders || []);
      setCustomers(custData.customers || []);
      setVehicles(vehData.vehicles || []);
      setProducts(prodData.products || []);

      if (custData.customers?.length > 0 && !formData.customerId) {
        setFormData((prev) => ({
          ...prev,
          customerId: custData.customers[0].id,
          vehicleId: vehData.vehicles?.[0]?.id || "",
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formData.customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateWOStatus = async (
    id: string,
    status: string,
    customerApproval?: string,
    autoSettle = false
  ) => {
    try {
      const res = await fetch("/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          customerApprovalStatus: customerApproval,
          autoSettle,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Gagal memperbarui status SPK");
        return;
      }

      if (status === "completed") {
        setNotification(
          `SPK #${json.workOrder?.workOrderNumber || "SPK"} berhasil diselesaikan! Faktur lunas otomatis dan pembayaran Rp ${(json.workOrder?.grandTotal || 0).toLocaleString()} telah masuk ke pendapatan kas bengkel.`
        );
        setTimeout(() => setNotification(null), 6000);
      }

      fetchData();
      if (selectedWO?.id === id) {
        setSelectedWO(json.workOrder);
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan memperbarui SPK");
    }
  };

  const handlePrintInvoiceForWO = (wo: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Faktur Lunas - ${wo.workOrderNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #101d35; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #101d35; padding-bottom: 12px; }
            .title { font-size: 20px; font-weight: bold; color: #101d35; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
            th, td { padding: 8px 10px; border-bottom: 1px solid #ddd; text-align: left; }
            th { background: #f5f7fa; font-weight: bold; }
            .text-right { text-align: right; }
            .totals { margin-top: 20px; float: right; width: 300px; font-size: 13px; }
            .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
            .grand-total { font-weight: bold; font-size: 15px; border-top: 2px solid #101d35; padding-top: 6px; }
            .paid-stamp { display: inline-block; margin-top: 15px; padding: 6px 14px; border: 2px solid #16a34a; color: #16a34a; font-weight: bold; font-size: 14px; border-radius: 6px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">BENGKEL SAHABAT MOTOR</div>
              <div style="font-size: 12px; color: #555;">Jl. Fatmawati Raya No. 45, Jakarta Selatan | Telp: 0812-3456-7890</div>
              <div style="font-size: 13px; font-weight: bold; margin-top: 6px;">BUKTI PEMBAYARAN & FAKTUR LUNAS RESMI</div>
            </div>
            <div style="text-align: right; font-size: 12px;">
              <div>No. SPK: <b>${wo.workOrderNumber}</b></div>
              <div>Tanggal Selesai: ${formatIndonesianDate(new Date())}</div>
              <div>Metode: <b>Kasir Tunai / Lunas</b></div>
            </div>
          </div>

          <div style="margin-top: 16px; font-size: 13px;">
            <div><strong>Pelanggan:</strong> ${wo.customer?.fullName || "Pelanggan"} (${wo.customer?.phone || "-"})</div>
            <div><strong>Kendaraan:</strong> ${wo.vehicle?.brand || ""} ${wo.vehicle?.model || ""} (${wo.vehicle?.licensePlate || "-"}) - Odometer: ${(wo.odometerIn || 0).toLocaleString()} km</div>
            <div><strong>Keluhan Servis:</strong> ${wo.customerComplaint || "-"}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Deskripsi Jasa / Suku Cadang</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Harga Satuan</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${(wo.items || []).map((it: any) => `
                <tr>
                  <td>
                    <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: ${it.itemType === 'service' ? '#dbeafe; color: #1d4ed8' : '#ffedd5; color: #c2410c'}; font-weight: bold; margin-right: 6px;">
                      ${it.itemType === 'service' ? 'JASA' : 'PART'}
                    </span>
                    ${it.name}
                  </td>
                  <td class="text-right">${it.quantity}</td>
                  <td class="text-right">${formatRupiah(it.unitPrice)}</td>
                  <td class="text-right">${formatRupiah(it.totalPrice || it.unitPrice * it.quantity)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="totals">
            <div><span>Total Jasa Servis:</span><span>${formatRupiah(wo.totalLabor)}</span></div>
            <div><span>Total Suku Cadang:</span><span>${formatRupiah(wo.totalParts)}</span></div>
            ${wo.discount ? `<div><span>Diskon:</span><span>-${formatRupiah(wo.discount)}</span></div>` : ""}
            <div class="grand-total"><span>Total Pembayaran:</span><span>${formatRupiah(wo.grandTotal)}</span></div>
            <div><span class="paid-stamp">LUNAS - DITERIMA KASIR</span></div>
          </div>
          <div style="clear: both;"></div>

          <div style="margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 10px; font-size: 11px; color: #666; text-align: center;">
            Terima kasih atas kunjungan Anda di Bengkel Sahabat Motor. Simpan faktur ini sebagai bukti garansi servis resmi (7 hari kerja).
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintSPK = (wo: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>SPK - ${wo.workOrderNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #101d35; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #101d35; padding-bottom: 12px; }
            .title { font-size: 20px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
            th, td { padding: 8px 10px; border-bottom: 1px solid #ddd; text-align: left; }
            th { background: #f5f7fa; }
            .text-right { text-align: right; }
            .totals { margin-top: 20px; float: right; width: 280px; font-size: 13px; }
            .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
            .grand-total { font-weight: bold; font-size: 15px; border-top: 2px solid #101d35; padding-top: 6px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">BENGKELPRO — SURAT PERINTAH KERJA (SPK)</div>
              <div>Bengkel Sahabat Motor</div>
              <div>Jl. Fatmawati Raya No. 45, Jakarta Selatan | Telp: 0812-3456-7890</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0;">${wo.workOrderNumber}</h2>
              <div>Tanggal: ${formatIndonesianDate(wo.createdAt)}</div>
              <div>Status: <b>${wo.status.toUpperCase()}</b></div>
            </div>
          </div>
          <div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px;">
            <div>
              <b>Data Pelanggan:</b><br/>
              Nama: ${wo.customer?.fullName || "-"}<br/>
              Telepon: ${wo.customer?.phone || "-"}
            </div>
            <div>
              <b>Data Kendaraan:</b><br/>
              Unit: ${wo.vehicle?.brand} ${wo.vehicle?.model} (${wo.vehicle?.licensePlate})<br/>
              Odometer Masuk: ${wo.odometerIn?.toLocaleString() || 0} km
            </div>
          </div>
          <div style="margin-top: 12px; font-size: 13px;">
            <b>Keluhan Pelanggan:</b> ${wo.customerComplaint || "-"}<br/>
            <b>Temuan Inspeksi Mekanik:</b> ${wo.inspectionFindings || "-"}
          </div>
          <table>
            <thead>
              <tr>
                <th>Item / Jasa / Suku Cadang</th>
                <th>Tipe</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Harga Satuan</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${(wo.items || []).map((it: any) => `
                <tr>
                  <td>${it.name}</td>
                  <td style="text-transform: capitalize;">${it.itemType === "part" ? "Suku Cadang" : "Jasa"}</td>
                  <td class="text-right">${it.quantity}</td>
                  <td class="text-right">${formatRupiah(it.unitPrice)}</td>
                  <td class="text-right">${formatRupiah(it.quantity * it.unitPrice)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="totals">
            <div><span>Total Jasa:</span><span>${formatRupiah(wo.totalLabor)}</span></div>
            <div><span>Total Sparepart:</span><span>${formatRupiah(wo.totalParts)}</span></div>
            <div><span>Diskon:</span><span>- ${formatRupiah(wo.discount || 0)}</span></div>
            <div><span>PPN (11%):</span><span>${formatRupiah(wo.tax || 0)}</span></div>
            <div class="grand-total"><span>Grand Total:</span><span>${formatRupiah(wo.grandTotal)}</span></div>
          </div>
          <div style="margin-top: 100px; display: flex; justify-content: space-between; font-size: 13px; text-align: center;">
            <div style="width: 180px; border-top: 1px solid #aaa; padding-top: 6px;">Persetujuan Pelanggan</div>
            <div style="width: 180px; border-top: 1px solid #aaa; padding-top: 6px;">Mekanik / Teknisi</div>
            <div style="width: 180px; border-top: 1px solid #aaa; padding-top: 6px;">Admin / Kasir</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleCreateWO = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat SPK baru.");

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan SPK.");
    } finally {
      setSubmitting(false);
    }
  };

  const addItemToForm = (type: "service" | "part") => {
    if (type === "service") {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            itemType: "service",
            name: "Jasa Ganti Oli Mesin",
            quantity: 1,
            unitPrice: 20000,
            isApproved: true,
          },
        ],
      });
    } else {
      const defaultProd = products[0];
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            itemType: "part",
            name: defaultProd ? defaultProd.name : "Oli Mesin",
            quantity: 1,
            unitPrice: defaultProd ? defaultProd.sellingPrice : 62000,
            isApproved: true,
          },
        ],
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role={role} userName={userName} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Surat Perintah Kerja (SPK)"
          subtitle="Alur lengkap pekerjaan servis kendaraan, estimasi, dan pemotongan suku cadang aman"
          currentRole={role}
          userName={userName}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {notification && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{notification}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="text-xs text-bengkel-muted">
              Total SPK Terdaftar: <span className="font-bold text-bengkel-navy">{workOrders.length}</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat SPK Baru</span>
            </button>
          </div>

          {/* Work Orders Table */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Nomor SPK</th>
                    <th className="py-3 px-4">Pelanggan & Kendaraan</th>
                    <th className="py-3 px-4">Keluhan & Temuan</th>
                    <th className="py-3 px-4 text-center">Persetujuan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Total Biaya</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                        Memuat data SPK...
                      </td>
                    </tr>
                  ) : workOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                        Belum ada SPK tercatat.
                      </td>
                    </tr>
                  ) : (
                    workOrders.map((wo) => (
                      <tr key={wo.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-xs text-bengkel-navy bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                            {wo.workOrderNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-bengkel-navy">{wo.customer?.fullName}</div>
                          <div className="text-[11px] text-bengkel-muted">
                            {wo.vehicle?.brand} {wo.vehicle?.model} ({wo.vehicle?.licensePlate})
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="text-bengkel-text font-medium truncate">{wo.customerComplaint}</div>
                          {wo.inspectionFindings && (
                            <div className="text-[11px] text-gray-400 truncate">
                              Temuan: {wo.inspectionFindings}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              wo.customerApprovalStatus === "approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : wo.customerApprovalStatus === "rejected"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {wo.customerApprovalStatus === "approved"
                              ? "Disetujui"
                              : wo.customerApprovalStatus === "rejected"
                              ? "Ditolak"
                              : "Menunggu ACC"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge status={wo.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-bengkel-navy">
                          {formatRupiah(wo.grandTotal)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedWO(wo)}
                              className="px-2 py-1 text-xs font-semibold rounded-md border border-gray-200 text-bengkel-navy hover:bg-gray-100 flex items-center gap-1 transition-colors"
                              title="Lihat Detail SPK"
                            >
                              <Eye className="w-3.5 h-3.5 text-bengkel-orange" />
                              <span>Detail</span>
                            </button>
                            {wo.status !== "completed" && (
                              <>
                                {wo.customerApprovalStatus === "pending" && (
                                  <button
                                    onClick={() => handleUpdateWOStatus(wo.id, wo.status, "approved")}
                                    className="px-2 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                  >
                                    ACC Pelanggan
                                  </button>
                                )}
                                {wo.status === "waiting" && (
                                  <button
                                    onClick={() => handleUpdateWOStatus(wo.id, "inspection")}
                                    className="px-2 py-1 text-xs font-semibold rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                                  >
                                    Mulai Inspeksi
                                  </button>
                                )}
                                {wo.status === "inspection" && (
                                  <button
                                    onClick={() => handleUpdateWOStatus(wo.id, "in_progress", "approved")}
                                    className="px-2 py-1 text-xs font-semibold rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                                  >
                                    Kerjakan
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUpdateWOStatus(wo.id, "completed", "approved", true)}
                                  className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1 transition-colors"
                                  title="Selesaikan servis dan bayar lunas otomatis ke pendapatan kas"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Selesai & Bayar Lunas</span>
                                </button>
                              </>
                            )}
                            {wo.status === "completed" && (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Lunas & Selesai</span>
                                </span>
                                <button
                                  onClick={() => handlePrintInvoiceForWO(wo)}
                                  className="px-2 py-1 text-xs font-semibold rounded-md border border-gray-200 text-bengkel-navy hover:bg-gray-100 flex items-center gap-1 transition-colors"
                                  title="Cetak Bukti Pembayaran / Faktur"
                                >
                                  <Printer className="w-3.5 h-3.5 text-bengkel-orange" />
                                  <span>Faktur</span>
                                </button>
                              </div>
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

          {/* Modal Buat SPK Baru */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-bengkel-border space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Buat Surat Perintah Kerja (SPK)</h3>
                  <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-bengkel-red flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreateWO} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Pilih Pelanggan *
                      </label>
                      <select
                        required
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs bg-white"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullName} ({c.phone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Pilih Kendaraan *
                      </label>
                      <select
                        required
                        value={formData.vehicleId}
                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs bg-white"
                      >
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.licensePlate} — {v.brand} {v.model}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Odometer Masuk (km) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={formData.odometerIn}
                        onChange={(e) => setFormData({ ...formData, odometerIn: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Keluhan Pelanggan *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.customerComplaint}
                      onChange={(e) => setFormData({ ...formData, customerComplaint: e.target.value })}
                      placeholder="Keluhan yang dilaporkan customer..."
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Temuan Inspeksi Awal (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.inspectionFindings}
                      onChange={(e) => setFormData({ ...formData, inspectionFindings: e.target.value })}
                      placeholder="Kondisi part, oli, rem saat dicek mekanik..."
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  {/* Line Items: Services & Parts */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-bengkel-navy uppercase tracking-wider">Item Jasa & Suku Cadang</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => addItemToForm("service")}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px]"
                        >
                          + Tambah Jasa
                        </button>
                        <button
                          type="button"
                          onClick={() => addItemToForm("part")}
                          className="px-2.5 py-1 rounded bg-orange-50 text-bengkel-orange hover:bg-orange-100 font-bold text-[11px]"
                        >
                          + Tambah Spare Part
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {formData.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${it.itemType === "service" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                            {it.itemType === "service" ? "JASA" : "PART"}
                          </span>
                          <input
                            type="text"
                            value={it.name}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].name = e.target.value;
                              setFormData({ ...formData, items: newItems });
                            }}
                            className="flex-1 px-2 py-1 rounded border border-gray-200 text-xs bg-white"
                          />
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].quantity = parseInt(e.target.value) || 1;
                              setFormData({ ...formData, items: newItems });
                            }}
                            className="w-14 px-2 py-1 rounded border border-gray-200 text-xs bg-white text-center"
                          />
                          <input
                            type="number"
                            min={0}
                            value={it.unitPrice}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].unitPrice = parseInt(e.target.value) || 0;
                              setFormData({ ...formData, items: newItems });
                            }}
                            className="w-24 px-2 py-1 rounded border border-gray-200 text-xs bg-white text-right"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = formData.items.filter((_, i) => i !== idx);
                              setFormData({ ...formData, items: newItems });
                            }}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-3.5 py-2 rounded-lg border border-gray-200 text-bengkel-text hover:bg-gray-50 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-bengkel-orange text-white hover:bg-bengkel-orange-hover font-bold shadow-xs"
                    >
                      {submitting ? "Membuat..." : "Terbitkan SPK"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Detail SPK */}
          {selectedWO && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-bengkel-border space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-bengkel-navy bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                        {selectedWO.workOrderNumber}
                      </span>
                      <Badge status={selectedWO.status} />
                    </div>
                    <div className="text-xs text-bengkel-muted mt-1">
                      Diterbitkan pada {formatIndonesianDate(selectedWO.createdAt, true)}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedWO(null)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Pelanggan & Unit Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <div className="text-bengkel-muted font-medium">Pelanggan:</div>
                    <div className="font-bold text-bengkel-navy text-sm mt-0.5">{selectedWO.customer?.fullName}</div>
                    <div className="text-gray-500 mt-0.5">{selectedWO.customer?.phone}</div>
                  </div>
                  <div>
                    <div className="text-bengkel-muted font-medium">Kendaraan:</div>
                    <div className="font-bold text-bengkel-navy text-sm mt-0.5">
                      {selectedWO.vehicle?.brand} {selectedWO.vehicle?.model}
                    </div>
                    <div className="font-mono font-bold text-bengkel-orange mt-0.5">
                      {selectedWO.vehicle?.licensePlate} • Odometer: {selectedWO.odometerIn?.toLocaleString()} km
                    </div>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-gray-200">
                    <span className="font-bold text-bengkel-navy">Keluhan Pelanggan: </span>
                    <span className="text-bengkel-text">{selectedWO.customerComplaint}</span>
                  </div>
                  {selectedWO.inspectionFindings && (
                    <div className="sm:col-span-2">
                      <span className="font-bold text-bengkel-navy">Temuan Inspeksi Teknisi: </span>
                      <span className="text-bengkel-text">{selectedWO.inspectionFindings}</span>
                    </div>
                  )}
                </div>

                {/* Rincian Jasa & Suku Cadang */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-bengkel-navy">
                    Daftar Pekerjaan &amp; Penggunaan Suku Cadang
                  </h4>
                  <div className="border border-bengkel-border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-bengkel-border font-bold text-bengkel-muted uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Item / Layanan</th>
                          <th className="py-2.5 px-3">Tipe</th>
                          <th className="py-2.5 px-3 text-center">Status ACC</th>
                          <th className="py-2.5 px-3 text-right">Qty</th>
                          <th className="py-2.5 px-3 text-right">Harga</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(selectedWO.items || []).map((it: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-2.5 px-3 font-medium text-bengkel-navy">{it.name}</td>
                            <td className="py-2.5 px-3 capitalize text-bengkel-muted">
                              {it.itemType === "part" ? "Suku Cadang" : "Jasa"}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  it.isApproved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {it.isApproved ? "Disetujui" : "Menunggu"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium">{it.quantity}</td>
                            <td className="py-2.5 px-3 text-right text-bengkel-muted">
                              {formatRupiah(it.unitPrice)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-bengkel-navy">
                              {formatRupiah(it.quantity * it.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Kalkulasi Ringkasan */}
                <div className="p-3 bg-slate-50 rounded-xl border border-bengkel-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-bengkel-muted">
                    <span>Jasa: <b>{formatRupiah(selectedWO.totalLabor)}</b></span>
                    <span>Part: <b>{formatRupiah(selectedWO.totalParts)}</b></span>
                    <span>PPN 11%: <b>{formatRupiah(selectedWO.tax)}</b></span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-bengkel-muted mr-2">Grand Total:</span>
                    <span className="text-base font-black text-bengkel-orange">
                      {formatRupiah(selectedWO.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons in Modal */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100">
                  <button
                    onClick={() => handlePrintSPK(selectedWO)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-bengkel-navy hover:bg-gray-100 text-xs font-bold transition-colors"
                  >
                    <Printer className="w-4 h-4 text-bengkel-orange" />
                    <span>Cetak Lembar SPK</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedWO.status !== "completed" && (
                      <>
                        {selectedWO.customerApprovalStatus === "pending" && (
                          <button
                            onClick={() => handleUpdateWOStatus(selectedWO.id, selectedWO.status, "approved")}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                          >
                            ACC Estimasi Biaya
                          </button>
                        )}
                        {selectedWO.status === "waiting" && (
                          <button
                            onClick={() => handleUpdateWOStatus(selectedWO.id, "inspection")}
                            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
                          >
                            Mulai Inspeksi
                          </button>
                        )}
                        {selectedWO.status === "inspection" && (
                          <button
                            onClick={() => handleUpdateWOStatus(selectedWO.id, "in_progress", "approved")}
                            className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors"
                          >
                            Kerjakan
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateWOStatus(selectedWO.id, "completed", "approved", true)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                          title="Selesaikan servis dan bayar lunas langsung ke pendapatan kas"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Selesai &amp; Bayar Lunas</span>
                        </button>
                      </>
                    )}
                    {selectedWO.status === "completed" && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Lunas &amp; Selesai</span>
                        </span>
                        <button
                          onClick={() => handlePrintInvoiceForWO(selectedWO)}
                          className="px-3 py-2 rounded-xl bg-bengkel-orange hover:bg-bengkel-orange-hover text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Cetak Faktur Lunas</span>
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedWO(null)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-bengkel-text hover:bg-gray-50 text-xs font-bold"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
