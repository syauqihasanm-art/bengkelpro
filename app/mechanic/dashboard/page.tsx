"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Badge } from "@/components/Badge";
import {
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  Play,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";
import { DEFAULT_MECHANIC_ID, getActiveSession } from "@/lib/session";

const ACTIVE_STATUSES = ["waiting", "inspection", "waiting_approval", "in_progress", "waiting_parts"];
const DONE_STATUSES = ["work_done", "awaiting_payment", "completed", "delivered"];

export default function MechanicDashboardPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState({ name: "Agus Prasetyo", mechanicId: DEFAULT_MECHANIC_ID });

  const fetchWorkOrders = useCallback(async () => {
    setLoading(true);
    try {
      const session = getActiveSession("mechanic");
      const mechId = session.mechanicId || session.userId || DEFAULT_MECHANIC_ID;
      setSessionUser({ name: session.userName || "Agus Prasetyo", mechanicId: mechId });

      const res = await fetch(`/api/work-orders?mechanicId=${encodeURIComponent(mechId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setWorkOrders(data.workOrders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const activeJobs = workOrders.filter((w) => ACTIVE_STATUSES.includes(w.status));
  const completedJobs = workOrders.filter((w) => DONE_STATUSES.includes(w.status));

  const handleStartJob = async (wo: any) => {
    setSubmittingId(wo.id);
    setErrorMsg(null);
    setNotification(null);
    try {
      const res = await fetch("/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: wo.id,
          status: "in_progress",
          notes: notesById[wo.id] || wo.finalNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memulai pengerjaan SPK.");
      setNotification(`Pekerjaan ${wo.workOrderNumber} dimulai (Sedang Dikerjakan).`);
      await fetchWorkOrders();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui status pengerjaan.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCompleteJob = async (wo: any) => {
    setSubmittingId(wo.id);
    setErrorMsg(null);
    setNotification(null);
    try {
      const customNote = (notesById[wo.id] || "").trim();
      const res = await fetch("/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: wo.id,
          action: "mechanic_complete",
          mechanicId: sessionUser.mechanicId,
          inspectionFindings: customNote || wo.inspectionFindings,
          workResult:
            customNote ||
            wo.workResult ||
            `Pekerjaan servis ${wo.workOrderNumber} telah selesai dikerjakan oleh mekanik ${sessionUser.name}.`,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyelesaikan pekerjaan SPK.");
      }
      setNotification(
        json.message ||
          `Pekerjaan ${wo.workOrderNumber} berhasil diselesaikan (Selesai Dikerjakan) dan masuk ke antrean Admin/Kasir.`
      );
      await fetchWorkOrders();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyelesaikan pekerjaan.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="mechanic" userName={sessionUser.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Portal Teknisi & Mekanik"
          subtitle="Daftar pekerjaan aktif di pit servis, inspeksi kendaraan, dan pemakaian spare part"
          currentRole="mechanic"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {notification && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2 shadow-2xs"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* KPI Cards for Mechanic */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              title="Pekerjaan Aktif Ditugaskan"
              value={activeJobs.length}
              description="Kendaraan yang sedang ditangani saat ini"
              icon={<Wrench className="w-5 h-5" />}
              variant="orange"
            />
            <StatsCard
              title="Servis Selesai Bulan Ini"
              value={completedJobs.length}
              description="Sudah selesai dikerjakan & diteruskan ke Kasir"
              icon={<CheckCircle2 className="w-5 h-5" />}
              variant="green"
            />
            <StatsCard
              title="Rating Kepuasan Servis"
              value="4.9 / 5.0"
              description="Berdasarkan umpan balik pelanggan bengkel"
              icon={<Clock className="w-5 h-5" />}
              variant="navy"
            />
          </div>

          {/* Active Work Orders for Mechanic */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-bengkel-navy">Tugas Perbaikan Aktif Anda</h3>
                <p className="text-xs text-bengkel-muted">
                  Pilih kendaraan untuk input suku cadang atau tekan tombol Selesai setelah perbaikan tuntas
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fetchWorkOrders}
                  className="inline-flex items-center gap-1 text-xs font-medium text-bengkel-muted hover:text-bengkel-navy"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
                <Link href="/mechanic/jobs" className="text-xs font-bold text-bengkel-orange hover:underline">
                  Lihat Seluruh Tugas
                </Link>
              </div>
            </div>

            {activeJobs.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 text-xs text-bengkel-muted">
                Tidak ada pekerjaan aktif saat ini. Semua SPK yang ditugaskan telah diselesaikan.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeJobs.map((wo) => (
                  <div
                    key={wo.id}
                    data-testid={`active-job-${wo.workOrderNumber}`}
                    className="p-4 rounded-xl border border-bengkel-border bg-gray-50/50 hover:bg-white hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-bengkel-navy bg-white px-2.5 py-1 rounded-md border border-gray-200">
                        {wo.workOrderNumber}
                      </span>
                      <Badge status={wo.status} />
                    </div>

                    <div>
                      <div className="font-bold text-sm text-bengkel-navy">
                        {wo.vehicle?.brand} {wo.vehicle?.model} ({wo.vehicle?.licensePlate})
                      </div>
                      <div className="text-xs text-bengkel-muted mt-0.5">
                        Pemilik: {wo.customer?.fullName} • Odometer: {wo.odometerIn} km
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-gray-200 text-xs">
                      <span className="font-bold text-bengkel-navy">Keluhan: </span>
                      <span className="text-bengkel-text">{wo.customerComplaint}</span>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={notesById[wo.id] ?? wo.workResult ?? ""}
                        onChange={(e) =>
                          setNotesById((prev) => ({ ...prev, [wo.id]: e.target.value }))
                        }
                        placeholder="Catatan hasil pengerjaan mekanik (opsional)..."
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-bengkel-orange"
                      />
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400">
                        Item Terdaftar: {wo.items?.length || 0} part & jasa
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {wo.status !== "in_progress" && (
                          <button
                            type="button"
                            onClick={() => handleStartJob(wo)}
                            disabled={submittingId === wo.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                          >
                            <Play className="w-3 h-3" />
                            <span>Mulai</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCompleteJob(wo)}
                          disabled={submittingId === wo.id}
                          data-testid={`complete-wo-${wo.workOrderNumber}`}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs disabled:opacity-60"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{submittingId === wo.id ? "Memproses..." : "Selesai"}</span>
                        </button>
                        <Link
                          href={`/mechanic/jobs/${wo.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover transition-colors"
                        >
                          <span>Buka Tugas Servis</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Completed Jobs Moving Out of Active Queue */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-bengkel-navy">Riwayat Servis Selesai</h3>
                <p className="text-xs text-bengkel-muted">
                  Pekerjaan yang telah selesai dikerjakan dan diteruskan ke Admin/Kasir
                </p>
              </div>
              <Link href="/mechanic/history" className="text-xs font-bold text-bengkel-orange hover:underline">
                Lihat Semua Riwayat
              </Link>
            </div>

            {completedJobs.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-gray-200 text-xs text-bengkel-muted">
                Belum ada riwayat pekerjaan selesai pada sesi ini.
              </div>
            ) : (
              <div className="space-y-2.5">
                {completedJobs.map((wo) => (
                  <div
                    key={wo.id}
                    data-testid={`completed-job-${wo.workOrderNumber}`}
                    className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-bengkel-navy">{wo.workOrderNumber}</span>
                        <span className="font-bold text-bengkel-navy">
                          {wo.vehicle?.brand} {wo.vehicle?.model} ({wo.vehicle?.licensePlate})
                        </span>
                      </div>
                      <div className="text-[11px] text-bengkel-muted mt-0.5">
                        Pelanggan: {wo.customer?.fullName} • Hasil: {wo.workResult || wo.finalNotes || "Servis selesai"} •{" "}
                        {formatIndonesianDate(wo.mechanicCompletedAt || wo.updatedAt, true)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={wo.invoiceStatus === "paid" || wo.paidAt ? "paid" : wo.status} size="sm" />
                      <Link
                        href={`/mechanic/jobs/${wo.id}`}
                        className="px-2.5 py-1 rounded-md border border-gray-200 bg-white text-[11px] font-bold text-bengkel-navy hover:bg-gray-100"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
