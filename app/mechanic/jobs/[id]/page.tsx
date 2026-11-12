"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import {
  Wrench,
  Car,
  User,
  CheckCircle2,
  Save,
  ArrowLeft,
  AlertCircle,
  Package,
  X,
  Plus,
} from "lucide-react";
import { formatIndonesianDate, formatRupiah } from "@/lib/utils";
import { DEFAULT_MECHANIC_ID, getActiveSession } from "@/lib/session";

export default function MechanicJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [workOrder, setWorkOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspectionText, setInspectionText] = useState("");
  const [workResultText, setWorkResultText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Products from inventory for mechanic to select
  const [products, setProducts] = useState<any[]>([]);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState({
    itemType: "part" as "part" | "service",
    name: "",
    quantity: 1,
    unitPrice: 0,
    referenceId: "",
  });

  const fetchWorkOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/work-orders?id=${id}`, { cache: "no-store" });
      const data = await res.json();
      if (data.workOrder) {
        setWorkOrder(data.workOrder);
        setInspectionText(data.workOrder.inspectionFindings || "");
        setWorkResultText(data.workOrder.workResult || data.workOrder.finalNotes || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchWorkOrder();
      fetchProducts();
    }
  }, [id, fetchWorkOrder, fetchProducts]);

  const handleUpdateStatus = async (status: string) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const session = getActiveSession("mechanic");
      const mechanicId = session.mechanicId || session.userId || DEFAULT_MECHANIC_ID;
      const isCompleteAction = status === "work_done" || status === "completed";

      const res = await fetch("/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isCompleteAction
            ? {
                id,
                action: "mechanic_complete",
                mechanicId,
                inspectionFindings: inspectionText,
                workResult:
                  workResultText.trim() ||
                  inspectionText.trim() ||
                  "Pekerjaan servis telah diselesaikan oleh mekanik.",
              }
            : {
                id,
                status,
                notes: workResultText || inspectionText,
                workResult: workResultText || undefined,
                inspectionFindings: inspectionText,
              }
        ),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui status SPK");

      if (isCompleteAction) {
        setNotification(
          json.message ||
            "Pekerjaan berhasil diselesaikan (Selesai Dikerjakan) dan otomatis masuk ke antrean Admin/Kasir."
        );
      } else {
        setNotification("Status pengerjaan berhasil diperbarui menjadi Sedang Dikerjakan!");
      }
      setTimeout(() => setNotification(null), 4000);
      fetchWorkOrder();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui status SPK");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNotesOnly = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          inspectionFindings: inspectionText,
          workResult: workResultText,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan temuan");

      setNotification("Catatan temuan inspeksi mekanik berhasil disimpan!");
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan catatan inspeksi");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name) {
      setErrorMsg("Nama item / suku cadang harus diisi.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          addItem: {
            itemType: itemForm.itemType,
            name: itemForm.name,
            quantity: itemForm.quantity,
            unitPrice: itemForm.unitPrice,
            referenceId: itemForm.referenceId || undefined,
            isApproved: true,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambahkan suku cadang / jasa.");

      setNotification(`Berhasil menambahkan "${itemForm.name}" ke lembar kerja SPK!`);
      setTimeout(() => setNotification(null), 4000);

      setItemModalOpen(false);
      setItemForm({
        itemType: "part",
        name: "",
        quantity: 1,
        unitPrice: 0,
        referenceId: "",
      });
      fetchWorkOrder();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menambahkan item ke SPK.");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="mechanic" userName="Agus Prasetyo" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={`Detail Servis: ${workOrder?.workOrderNumber || "SPK"}`}
          subtitle="Formulir inspeksi mekanik dan konfirmasi pekerjaan di pit servis"
          currentRole="mechanic"
        />

        <main className="flex-1 p-6 space-y-6 max-w-4xl w-full mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-bengkel-muted hover:text-bengkel-navy"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Pekerjaan</span>
          </button>

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

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-bengkel-muted text-xs">
              Memuat lembar pengerjaan servis...
            </div>
          ) : workOrder && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bengkel-border shadow-xs space-y-6">
              {/* Header Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <span className="font-mono font-bold text-lg text-bengkel-navy">{workOrder.workOrderNumber}</span>
                  <div className="text-xs text-bengkel-muted mt-0.5">
                    Dibuat: {formatIndonesianDate(workOrder.createdAt, true)}
                  </div>
                </div>
                <Badge status={workOrder.invoiceStatus === "paid" || workOrder.paidAt ? "paid" : workOrder.status} size="md" />
              </div>

              {/* Vehicle & Customer Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-bengkel-bg border border-bengkel-border text-xs">
                <div>
                  <div className="font-bold text-bengkel-navy uppercase tracking-wider mb-1">Kendaraan</div>
                  <div className="text-sm font-bold text-bengkel-navy">
                    {workOrder.vehicle?.brand} {workOrder.vehicle?.model}
                  </div>
                  <div className="font-mono text-bengkel-orange font-bold mt-0.5">{workOrder.vehicle?.licensePlate}</div>
                  <div className="text-gray-500 mt-1">Odometer Masuk: {workOrder.odometerIn.toLocaleString()} km</div>
                </div>

                <div>
                  <div className="font-bold text-bengkel-navy uppercase tracking-wider mb-1">Pemilik Kendaraan</div>
                  <div className="text-sm font-bold text-bengkel-navy">{workOrder.customer?.fullName}</div>
                  <div className="text-gray-500 mt-0.5">Telepon: {workOrder.customer?.phone}</div>
                </div>
              </div>

              {/* Customer Complaint */}
              <div>
                <h4 className="text-xs font-bold text-bengkel-navy uppercase tracking-wider mb-1.5">
                  Keluhan Pelanggan yang Dilaporkan:
                </h4>
                <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-200/60 text-xs text-bengkel-text">
                  {workOrder.customerComplaint}
                </div>
              </div>

              {/* Inspection Findings Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-bengkel-navy uppercase tracking-wider">
                    Catatan Temuan Inspeksi Mekanik:
                  </h4>
                  <button
                    onClick={handleSaveNotesOnly}
                    disabled={submitting}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-bengkel-orange hover:text-bengkel-orange-hover"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Catatan</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={inspectionText}
                  onChange={(e) => setInspectionText(e.target.value)}
                  placeholder="Tuliskan kondisi part, keausan rem, kelayakan oli, atau temuan fisik lainnya..."
                  className="w-full p-3 rounded-xl border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                />

                <h4 className="text-xs font-bold text-bengkel-navy uppercase tracking-wider pt-2">
                  Hasil Pekerjaan & Tindakan Perbaikan Mekanik:
                </h4>
                <textarea
                  rows={2}
                  value={workResultText}
                  onChange={(e) => setWorkResultText(e.target.value)}
                  placeholder="Tuliskan tindakan perbaikan yang sudah selesai dikerjakan mekanik..."
                  className="w-full p-3 rounded-xl border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                />
              </div>

              {/* Line Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-bengkel-navy uppercase tracking-wider">
                    Daftar Pekerjaan & Suku Cadang Terkait:
                  </h4>
                  {!["work_done", "awaiting_payment", "completed", "delivered", "cancelled"].includes(workOrder.status) && (
                    <button
                      type="button"
                      onClick={() => setItemModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-bengkel-orange hover:text-bengkel-orange-hover"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Suku Cadang / Jasa</span>
                    </button>
                  )}
                </div>

                <div className="divide-y divide-gray-100 border border-bengkel-border rounded-xl overflow-hidden text-xs">
                  {(workOrder.items || []).map((it: any) => (
                    <div key={it.id} className="p-3 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${it.itemType === "service" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                          {it.itemType === "service" ? "JASA" : "PART"}
                        </span>
                        <span className="font-bold text-bengkel-navy">{it.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-bengkel-muted">
                        <div>
                          Qty: <span className="font-bold text-bengkel-navy">{it.quantity}</span>
                        </div>
                        <div className="font-bold text-bengkel-navy">
                          {formatRupiah(it.totalPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 text-right text-xs">
                  <span className="text-bengkel-muted">Total Estimasi SPK: </span>
                  <span className="font-bold text-bengkel-navy text-sm">{formatRupiah(workOrder.grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons for Mechanic */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                {["work_done", "awaiting_payment", "completed", "delivered"].includes(workOrder.status) ? (
                  <div className="w-full p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between gap-2">
                    <span>
                      {workOrder.status === "work_done"
                        ? "Status: Selesai Dikerjakan. Pekerjaan telah masuk antrean Admin/Kasir untuk pembuatan invoice."
                        : workOrder.status === "awaiting_payment"
                        ? "Status: Menunggu Pembayaran di meja Admin/Kasir."
                        : "Status: Lunas & Selesai."}
                    </span>
                    <Badge status={workOrder.invoiceStatus === "paid" || workOrder.paidAt ? "paid" : workOrder.status} size="sm" />
                  </div>
                ) : (
                  <div className="w-full flex flex-wrap items-center justify-end gap-3">
                    {workOrder.status !== "in_progress" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus("in_progress")}
                        disabled={submitting}
                        className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        Mulai Pengerjaan Servis
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("work_done")}
                      disabled={submitting}
                      data-testid="detail-complete-wo"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{submitting ? "Memproses..." : "Selesai & Kirim ke Kasir"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Tambah Suku Cadang / Jasa */}
          {itemModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Tambah Part / Jasa Servis</h3>
                  <button onClick={() => setItemModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddItem} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Tipe Item *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setItemForm({ ...itemForm, itemType: "part" })}
                        className={`py-2 rounded-lg border font-bold text-center ${
                          itemForm.itemType === "part"
                            ? "bg-bengkel-orange text-white border-bengkel-orange shadow-xs"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                      >
                        Suku Cadang (Part)
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemForm({ ...itemForm, itemType: "service" })}
                        className={`py-2 rounded-lg border font-bold text-center ${
                          itemForm.itemType === "service"
                            ? "bg-bengkel-orange text-white border-bengkel-orange shadow-xs"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                      >
                        Jasa Teknisi
                      </button>
                    </div>
                  </div>

                  {itemForm.itemType === "part" && (
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Pilih dari Inventaris Stok
                      </label>
                      <select
                        value={itemForm.referenceId}
                        onChange={(e) => {
                          const prod = products.find((p) => p.id === e.target.value);
                          if (prod) {
                            setItemForm({
                              ...itemForm,
                              referenceId: prod.id,
                              name: prod.name,
                              unitPrice: prod.sellingPrice,
                            });
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                      >
                        <option value="">-- Pilih Barang dari Gudang --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Tersedia: {p.stockQuantity}) - {formatRupiah(p.sellingPrice)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nama Part / Tindakan Servis *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={itemForm.itemType === "part" ? "e.g. Busi Denso Iridium" : "e.g. Kuras Minyak Rem"}
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Jumlah (Qty) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={itemForm.quantity}
                        onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs text-right font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Harga Satuan (Rp) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={itemForm.unitPrice}
                        onChange={(e) => setItemForm({ ...itemForm, unitPrice: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs text-right font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setItemModalOpen(false)}
                      className="px-3.5 py-2 rounded-lg border border-gray-200 text-bengkel-text hover:bg-gray-50 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-bengkel-orange text-white hover:bg-bengkel-orange-hover font-bold shadow-xs"
                    >
                      {submitting ? "Menambahkan..." : "Tambahkan ke SPK"}
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
