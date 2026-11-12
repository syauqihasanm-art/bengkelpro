"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { formatIndonesianDate } from "@/lib/utils";
import { DEFAULT_MECHANIC_ID, getActiveSession } from "@/lib/session";

const DONE_STATUSES = ["work_done", "awaiting_payment", "completed", "delivered"];

export default function MechanicHistoryPage() {
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Agus Prasetyo");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const session = getActiveSession("mechanic");
      const mechId = session.mechanicId || session.userId || DEFAULT_MECHANIC_ID;
      setUserName(session.userName || "Agus Prasetyo");

      const res = await fetch(`/api/work-orders?mechanicId=${encodeURIComponent(mechId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      const finished = (data.workOrders || []).filter((wo: any) =>
        DONE_STATUSES.includes(wo.status)
      );
      setCompletedJobs(finished);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="mechanic" userName={userName} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Riwayat Pekerjaan Mekanik"
          subtitle="Daftar seluruh kendaraan yang telah selesai dikerjakan mekanik"
          currentRole="mechanic"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Nomor SPK</th>
                    <th className="py-3 px-4">Kendaraan</th>
                    <th className="py-3 px-4">Pekerjaan / Suku Cadang</th>
                    <th className="py-3 px-4">Hasil Mekanik</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Tanggal Selesai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-bengkel-muted">
                        Memuat riwayat pekerjaan...
                      </td>
                    </tr>
                  ) : completedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-bengkel-muted">
                        Belum ada pekerjaan selesai dikerjakan.
                      </td>
                    </tr>
                  ) : (
                    completedJobs.map((wo) => (
                      <tr key={wo.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-bengkel-navy">
                          {wo.workOrderNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-bengkel-navy">
                            {wo.vehicle?.brand} {wo.vehicle?.model}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            {wo.vehicle?.licensePlate}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-bengkel-muted">
                          {(wo.items || []).map((i: any) => i.name).join(", ") || "Servis berkala"}
                        </td>
                        <td className="py-3.5 px-4 text-bengkel-text max-w-xs truncate">
                          {wo.workResult || wo.finalNotes || wo.inspectionFindings || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge status={wo.invoiceStatus === "paid" || wo.paidAt ? "paid" : wo.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-right text-bengkel-muted">
                          {formatIndonesianDate(wo.mechanicCompletedAt || wo.updatedAt)}
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
