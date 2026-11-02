"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
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
} from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

export default function SuperAdminRegistrationsPage() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
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

      setNotification(`Status pendaftaran bengkel berhasil diperbarui menjadi ${status.toUpperCase()}`);
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
    const matchesFilter = filter === "all" ? true : w.status === filter;
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.city && w.city.toLowerCase().includes(search.toLowerCase())) ||
      (w.phone && w.phone.includes(search));
    return matchesFilter && matchesSearch;
  });

  const pendingCount = workshops.filter((w) => w.status === "pending").length;

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="super_admin" userName="Super Admin" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Verifikasi & Pendaftaran Bengkel"
          subtitle="Persetujuan onboarding mitra bengkel baru di platform SaaS BengkelPro"
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

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-bengkel-border shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-bengkel-muted font-medium">Menunggu Verifikasi</p>
                <h3 className="text-2xl font-black text-bengkel-orange mt-1">{pendingCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-bengkel-orange flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-bengkel-border shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-bengkel-muted font-medium">Bengkel Disetujui</p>
                <h3 className="text-2xl font-black text-emerald-700 mt-1">
                  {workshops.filter((w) => w.status === "approved").length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-bengkel-border shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-bengkel-muted font-medium">Total Permohonan</p>
                <h3 className="text-2xl font-black text-bengkel-navy mt-1">{workshops.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  filter === "pending"
                    ? "bg-bengkel-orange text-white"
                    : "bg-gray-100 text-bengkel-text hover:bg-gray-200"
                }`}
              >
                Menunggu ACC ({pendingCount})
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  filter === "approved"
                    ? "bg-emerald-700 text-white"
                    : "bg-gray-100 text-bengkel-text hover:bg-gray-200"
                }`}
              >
                Disetujui
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  filter === "rejected"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-bengkel-text hover:bg-gray-200"
                }`}
              >
                Ditolak
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  filter === "all"
                    ? "bg-bengkel-navy text-white"
                    : "bg-gray-100 text-bengkel-text hover:bg-gray-200"
                }`}
              >
                Semua ({workshops.length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama bengkel, kota, telp..."
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
              />
            </div>
          </div>

          {/* Registrations Table */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Nama Bengkel & Slug</th>
                    <th className="py-3 px-4">Kontak & Lokasi</th>
                    <th className="py-3 px-4">Kapasitas & Tipe</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Tgl Registrasi</th>
                    <th className="py-3 px-4 text-center">Aksi Keputusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-bengkel-muted">
                        Memuat data pendaftaran...
                      </td>
                    </tr>
                  ) : filteredWorkshops.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-bengkel-muted">
                        Tidak ada pendaftaran bengkel pada kategori ini.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkshops.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-bengkel-navy">{w.name}</div>
                          <div className="font-mono text-[11px] text-gray-400">/{w.slug}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-bengkel-text">
                            <Phone className="w-3.5 h-3.5 text-bengkel-orange" />
                            <span>{w.phone || "-"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{w.address ? `${w.address.slice(0, 30)}...` : "Jakarta"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-bengkel-navy">
                            {w.stallCount || 4} Stall Servis
                          </span>
                          <span className="block text-[11px] text-gray-400">
                            Kuota: {w.dailyBookingQuota || 15}/hari
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            w.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : w.status === "rejected"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {w.status === "approved" ? "Disetujui" : w.status === "rejected" ? "Ditolak" : "Pending"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-bengkel-muted text-[11px]">
                          {formatIndonesianDate(w.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedWorkshop(w)}
                              title="Tinjau Detail"
                              className="p-1.5 rounded-lg border border-bengkel-border text-bengkel-navy hover:bg-gray-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {w.status !== "approved" && (
                              <button
                                onClick={() => handleUpdateStatus(w.id, "approved")}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>
                            )}
                            {w.status !== "rejected" && (
                              <button
                                onClick={() => handleUpdateStatus(w.id, "rejected")}
                                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
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

          {/* Modal Tinjau Detail Bengkel */}
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
                      <span className="text-gray-400 block text-[11px]">Status Onboarding:</span>
                      <span className="font-bold uppercase text-bengkel-navy">{selectedWorkshop.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Paket Langganan:</span>
                      <span className="font-bold text-emerald-700">BengkelPro Pro (Trial)</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Nomor Telepon:</span>
                      <span className="font-semibold text-bengkel-text">{selectedWorkshop.phone || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Jumlah Stall:</span>
                      <span className="font-semibold text-bengkel-text">{selectedWorkshop.stallCount || 4} Pit Servis</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 block text-[11px] font-semibold mb-1">Alamat Lengkap Bengkel:</label>
                    <p className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-bengkel-text">
                      {selectedWorkshop.address || "Jl. Fatmawati Raya No. 45, Cilandak, Jakarta Selatan, DKI Jakarta 12430"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-[11px]">Tenant Database terisolasi penuh dengan Row-Level Security</span>
                    </div>
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
                    {selectedWorkshop.status !== "rejected" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedWorkshop.id, "rejected")}
                        className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
                      >
                        Tolak Pendaftaran
                      </button>
                    )}
                    {selectedWorkshop.status !== "approved" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedWorkshop.id, "approved")}
                        className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                      >
                        Setujui Bengkel
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
