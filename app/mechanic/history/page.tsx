"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { History, CheckCircle2 } from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

export default function MechanicHistoryPage() {
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/work-orders?status=completed")
      .then((res) => res.json())
      .then((data) => setCompletedJobs(data.workOrders || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="mechanic" userName="Agus Prasetyo" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Riwayat Pekerjaan Mekanik"
          subtitle="Daftar seluruh kendaraan yang telah berhasil diservis tuntas"
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
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Tanggal Selesai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completedJobs.map((wo) => (
                    <tr key={wo.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-bengkel-navy">
                        {wo.workOrderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-bengkel-navy">{wo.vehicle?.brand} {wo.vehicle?.model}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{wo.vehicle?.licensePlate}</div>
                      </td>
                      <td className="py-3.5 px-4 text-bengkel-muted">
                        {(wo.items || []).map((i: any) => i.name).join(", ") || "Servis berkala"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge status="completed" />
                      </td>
                      <td className="py-3.5 px-4 text-right text-bengkel-muted">
                        {formatIndonesianDate(wo.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
