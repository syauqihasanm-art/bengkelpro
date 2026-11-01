"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Badge } from "@/components/Badge";
import {
  Building2,
  Users,
  Crown,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export default function SuperAdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin");
      const data = await res.json();
      setMetrics(data.metrics);
      setWorkshops(data.workshops || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (workshopId: string, status: string) => {
    try {
      const res = await fetch("/api/super-admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workshopId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui status bengkel.");
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="super_admin" userName="Super Admin" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Super Admin Platform Oversight"
          subtitle="Kendali pusat seluruh bengkel, persetujuan tenant baru, dan metrik SaaS BengkelPro"
          currentRole="super_admin"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Security & Multi-tenant Status Banner */}
          <div className="p-4 rounded-xl bg-white border border-bengkel-border shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-bengkel-green flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-bengkel-navy">Isolasi Multi-Tenant PostgreSQL Aktif</h4>
                <p className="text-xs text-bengkel-muted">RLS terpasang ketat. Super Admin tidak membaca otomatis data finansial privat per bengkel tanpa otorisasi resmi.</p>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Sistem Normal (100% Uptime)
            </div>
          </div>

          {/* Platform KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Bengkel Terdaftar"
              value={metrics?.totalWorkshops || 0}
              description={`${metrics?.approvedWorkshops || 0} Bengkel Disetujui`}
              icon={<Building2 className="w-5 h-5" />}
              variant="navy"
            />
            <StatsCard
              title="Pendaftaran Menunggu ACC"
              value={metrics?.pendingWorkshops || 0}
              description="Perlu review Super Admin"
              icon={<AlertTriangle className="w-5 h-5" />}
              variant="orange"
            />
            <StatsCard
              title="Langganan Berbayar Aktif"
              value={metrics?.activeSubscriptions || 0}
              description="Paket Basic, Pro & Business"
              icon={<Crown className="w-5 h-5" />}
              variant="green"
            />
            <StatsCard
              title="Estimasi MRR Platform"
              value={formatRupiah(metrics?.platformMonthlyRevenue || 0)}
              description="Pendapatan berulang bulanan"
              icon={<TrendingUp className="w-5 h-5" />}
              variant="green"
            />
          </div>

          {/* Workshops Verification Table */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-bengkel-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-bengkel-navy">Daftar Pengajuan Bengkel Baru</h3>
                <p className="text-xs text-bengkel-muted">Tinjau informasi bengkel untuk memberikan persetujuan akses sistem</p>
              </div>
              <span className="text-xs text-bengkel-muted font-medium">
                Total: {workshops.length} Bengkel
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Nama Bengkel & Slug</th>
                    <th className="py-3 px-4">Kontak & Wilayah</th>
                    <th className="py-3 px-4">Tipe Bengkel</th>
                    <th className="py-3 px-4 text-center">Paket SaaS</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Persetujuan Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {workshops.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-bengkel-navy">{w.name}</div>
                        <div className="font-mono text-[11px] text-gray-400">/{w.slug}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-bengkel-text">{w.phone}</div>
                        <div className="text-[11px] text-gray-400">{w.city}, {w.province}</div>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-bengkel-muted">
                        Bengkel {w.workshopType}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-bengkel-orange border border-orange-200">
                          {w.subscriptionTier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge status={w.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {w.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(w.id, "approved")}
                                className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                              >
                                Setujui (ACC)
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(w.id, "rejected")}
                                className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                          {w.status === "approved" && (
                            <button
                              onClick={() => handleUpdateStatus(w.id, "suspended")}
                              className="px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            >
                              Tangguhkan (Suspend)
                            </button>
                          )}
                          {w.status === "suspended" && (
                            <button
                              onClick={() => handleUpdateStatus(w.id, "approved")}
                              className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            >
                              Aktifkan Kembali
                            </button>
                          )}
                        </div>
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
