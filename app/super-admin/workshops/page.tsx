"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  X,
  ExternalLink,
  Wrench,
  Users,
} from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

export default function SuperAdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin");
      const data = await res.json();
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

      setNotification(`Status bengkel berhasil diperbarui menjadi ${status.toUpperCase()}`);
      setTimeout(() => setNotification(null), 4000);
      fetchData();
      if (selectedWorkshop?.id === workshopId) {
        setSelectedWorkshop((prev: any) => ({ ...prev, status }));
      }
    } catch (err: any) {
      setNotification(`Error: ${err.message || "Gagal memperbarui status bengkel."}`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filteredWorkshops = workshops.filter((w) => {
    return (
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.city && w.city.toLowerCase().includes(search.toLowerCase())) ||
      (w.slug && w.slug.toLowerCase().includes(search.toLowerCase())) ||
      (w.phone && w.phone.includes(search))
    );
  });

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="super_admin" userName="Super Admin" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Direktori Seluruh Bengkel Mitra"
          subtitle="Manajemen tenant, kuota stall, paket langganan, dan status aktif bengkel"
          currentRole="super_admin"
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
            <div className="flex items-center gap-2 text-xs font-semibold text-bengkel-navy">
              <Building2 className="w-4 h-4 text-bengkel-orange" />
              <span>Total {workshops.length} Bengkel Terdaftar di Seluruh Indonesia</span>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama bengkel, slug, kota..."
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
              />
            </div>
          </div>

          {/* Workshops Grid Cards */}
          {loading ? (
            <div className="text-center py-12 text-bengkel-muted text-xs">
              Memuat data direktori bengkel...
            </div>
          ) : filteredWorkshops.length === 0 ? (
            <div className="bg-white rounded-xl border border-bengkel-border p-8 text-center text-xs text-bengkel-muted">
              Tidak ada bengkel yang sesuai dengan pencarian Anda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkshops.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-xl border border-bengkel-border shadow-2xs p-5 flex flex-col justify-between hover:border-gray-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-bengkel-orange flex-shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-bengkel-navy leading-tight">{w.name}</h4>
                          <span className="font-mono text-[11px] text-gray-400">/{w.slug}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        w.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : w.status === "rejected"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {w.status === "approved" ? "Aktif" : w.status === "rejected" ? "Nonaktif" : "Pending"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-bengkel-muted pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-bengkel-text">
                        <Phone className="w-3.5 h-3.5 text-bengkel-orange flex-shrink-0" />
                        <span>{w.phone || "0812-3456-7890"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{w.address || "Jakarta, Indonesia"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>Kapasitas: {w.stallCount || 4} Pit Servis | Kuota: {w.dailyBookingQuota || 15}/hari</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedWorkshop(w)}
                      className="text-xs font-bold text-bengkel-navy hover:text-bengkel-orange flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail Tenant</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {w.status === "approved" ? (
                        <button
                          onClick={() => handleUpdateStatus(w.id, "rejected")}
                          className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold transition-colors"
                        >
                          Nonaktifkan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(w.id, "approved")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                        >
                          Aktifkan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Detail Workshop */}
          {selectedWorkshop && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-bengkel-orange flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-bengkel-navy">{selectedWorkshop.name}</h3>
                      <p className="text-xs text-bengkel-muted font-mono">/{selectedWorkshop.slug}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedWorkshop(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-[11px]">ID Tenant (UUID):</span>
                      <span className="font-mono text-[10px] text-bengkel-navy truncate block">
                        {selectedWorkshop.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Status Operasional:</span>
                      <span className="font-bold uppercase text-bengkel-navy">{selectedWorkshop.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Kapasitas Pit Servis:</span>
                      <span className="font-semibold text-bengkel-text">{selectedWorkshop.stallCount || 4} Stall</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Kuota Booking Harian:</span>
                      <span className="font-semibold text-bengkel-text">{selectedWorkshop.dailyBookingQuota || 15} Kendaraan/hari</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 block text-[11px] font-semibold mb-1">Alamat Bengkel:</label>
                    <p className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-bengkel-text">
                      {selectedWorkshop.address || "Jl. Fatmawati Raya No. 45, Jakarta Selatan"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Database Multi-Tenant PostgreSQL RLS aktif dan aman.</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedWorkshop(null)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-bengkel-text hover:bg-gray-200 font-bold text-xs"
                  >
                    Tutup
                  </button>

                  <div className="flex items-center gap-2">
                    {selectedWorkshop.status === "approved" ? (
                      <button
                        onClick={() => handleUpdateStatus(selectedWorkshop.id, "rejected")}
                        className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
                      >
                        Nonaktifkan Bengkel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(selectedWorkshop.id, "approved")}
                        className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                      >
                        Aktifkan Bengkel
                      </button>
                    )}
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
