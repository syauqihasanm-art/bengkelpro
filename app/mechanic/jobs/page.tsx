"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { DEFAULT_MECHANIC_ID, getActiveSession } from "@/lib/session";

const DONE_STATUSES = ["work_done", "awaiting_payment", "completed", "delivered", "cancelled"];

export default function MechanicJobsPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState({ name: "Agus Prasetyo", mechanicId: DEFAULT_MECHANIC_ID });

  const fetchJobs = useCallback(async () => {
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
    fetchJobs();
  }, [fetchJobs]);

  const handleFinish = async (wo: any) => {
    setSubmittingId(wo.id);
    setNotification(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: wo.id,
          action: "mechanic_complete",
          mechanicId: sessionUser.mechanicId,
          workResult: wo.workResult || wo.inspectionFindings || `Pekerjaan ${wo.workOrderNumber} selesai dikerjakan.`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyelesaikan pekerjaan.");
      setNotification(json.message || `SPK ${wo.workOrderNumber} selesai dikerjakan dan masuk antrean Admin/Kasir.`);
      await fetchJobs();
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
          title="Daftar Pekerjaan Mekanik"
          subtitle="Seluruh antrean perbaikan dan inspeksi kendaraan"
          currentRole="mechanic"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {notification && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notification}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-xs text-bengkel-muted">Memuat daftar pekerjaan...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="bg-white rounded-2xl p-5 border border-bengkel-border shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs bg-gray-100 text-bengkel-navy px-2.5 py-1 rounded-md border border-gray-200">
                        {wo.workOrderNumber}
                      </span>
                      <Badge status={wo.invoiceStatus === "paid" || wo.paidAt ? "paid" : wo.status} />
                    </div>

                    <div>
                      <h3 className="font-black text-base text-bengkel-navy">
                        {wo.vehicle?.brand} {wo.vehicle?.model}
                      </h3>
                      <div className="text-xs font-mono font-bold text-bengkel-orange mt-0.5">
                        {wo.vehicle?.licensePlate}
                      </div>
                    </div>

                    <div className="text-xs text-bengkel-muted">
                      Pemilik: <span className="font-semibold text-bengkel-text">{wo.customer?.fullName}</span>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-bengkel-text">
                      <div className="font-bold text-bengkel-navy mb-0.5">Keluhan:</div>
                      <div className="truncate">{wo.customerComplaint}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-400">
                      Odometer: {wo.odometerIn.toLocaleString()} km
                    </span>
                    <div className="flex items-center gap-2">
                      {!DONE_STATUSES.includes(wo.status) && (
                        <button
                          type="button"
                          onClick={() => handleFinish(wo)}
                          disabled={submittingId === wo.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selesai</span>
                        </button>
                      )}
                      <Link
                        href={`/mechanic/jobs/${wo.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bengkel-navy hover:bg-bengkel-navy-light text-white text-xs font-bold transition-colors"
                      >
                        <span>{DONE_STATUSES.includes(wo.status) ? "Detail" : "Kerjakan"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
