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
} from "lucide-react";
import { formatIndonesianDate, formatRupiah } from "@/lib/utils";

export default function MechanicJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [workOrder, setWorkOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspectionText, setInspectionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchWorkOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/work-orders?id=${id}`);
      const data = await res.json();
      if (data.workOrder) {
        setWorkOrder(data.workOrder);
        setInspectionText(data.workOrder.inspectionFindings || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchWorkOrder();
  }, [id, fetchWorkOrder]);

  const handleUpdateStatus = async (status: string) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          notes: inspectionText,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui status SPK");

      setNotification(`Status SPK berhasil diperbarui menjadi ${status.toUpperCase()}!`);
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
          status: workOrder?.status || "in_progress",
          notes: inspectionText,
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
                <Badge status={workOrder.status} size="md" />
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
                  rows={3}
                  value={inspectionText}
                  onChange={(e) => setInspectionText(e.target.value)}
                  placeholder="Tuliskan kondisi part, keausan rem, kelayakan oli, atau temuan fisik lainnya..."
                  className="w-full p-3 rounded-xl border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                />
              </div>

              {/* Line Items List */}
              <div>
                <h4 className="text-xs font-bold text-bengkel-navy uppercase tracking-wider mb-2">
                  Daftar Pekerjaan & Suku Cadang Terkait:
                </h4>
                <div className="divide-y divide-gray-100 border border-bengkel-border rounded-xl overflow-hidden text-xs">
                  {(workOrder.items || []).map((it: any) => (
                    <div key={it.id} className="p-3 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${it.itemType === "service" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                          {it.itemType === "service" ? "JASA" : "PART"}
                        </span>
                        <span className="font-bold text-bengkel-navy">{it.name}</span>
                      </div>
                      <div className="text-bengkel-muted">
                        Jumlah: <span className="font-bold text-bengkel-navy">{it.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons for Mechanic */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
                {workOrder.status !== "in_progress" && workOrder.status !== "completed" && (
                  <button
                    onClick={() => handleUpdateStatus("in_progress")}
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Mulai Pengerjaan Servis
                  </button>
                )}

                {workOrder.status === "in_progress" && (
                  <button
                    onClick={() => handleUpdateStatus("completed")}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tandai Servis Selesai & Kirim ke Kasir</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
