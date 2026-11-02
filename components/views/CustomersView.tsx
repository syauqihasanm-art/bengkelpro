"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Search, Plus, Phone, Mail, MapPin, Car, DollarSign, X, CheckCircle2, AlertCircle, Eye, Edit, ExternalLink } from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export interface CustomersViewProps {
  role?: "workshop_owner" | "workshop_admin";
  userName?: string;
}

export function CustomersView({
  role = "workshop_owner",
  userName = "Budi Santoso",
}: CustomersViewProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [customerVehicles, setCustomerVehicles] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat customer.");

      setModalOpen(false);
      setFormData({ fullName: "", phone: "", email: "", address: "", notes: "" });
      fetchCustomers();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data pelanggan.");
    } finally {
      setSubmitting(false);
    }
  };

  const openCustomerDetail = async (c: any) => {
    setSelectedCustomer(c);
    try {
      const res = await fetch(`/api/vehicles?customerId=${c.id}`);
      const data = await res.json();
      setCustomerVehicles(data.vehicles || []);
    } catch {
      setCustomerVehicles([]);
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCustomer),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui data pelanggan.");
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui data pelanggan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role={role} userName={userName} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Manajemen Pelanggan"
          subtitle="Data pemilik kendaraan, kontak WhatsApp, dan riwayat transaksi"
          currentRole={role}
          userName={userName}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau no. telepon..."
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
              />
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pelanggan Baru</span>
            </button>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Nama Pelanggan</th>
                    <th className="py-3 px-4">Kontak (HP/Email)</th>
                    <th className="py-3 px-4">Alamat Domisili</th>
                    <th className="py-3 px-4 text-center">Kendaraan</th>
                    <th className="py-3 px-4 text-right">Total Transaksi</th>
                    <th className="py-3 px-4 text-center">Terdaftar Sejak</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                        Memuat data pelanggan...
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                        Tidak ada pelanggan yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-bengkel-navy">{c.fullName}</div>
                          {c.notes && <div className="text-[11px] text-gray-400 truncate max-w-xs">{c.notes}</div>}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-bengkel-text flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-bengkel-orange" />
                            <span>{c.phone}</span>
                          </div>
                          {c.email && (
                            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              <span>{c.email}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-bengkel-muted max-w-xs truncate">
                          {c.address || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                            <Car className="w-3 h-3" />
                            <span>{c.vehiclesCount || 0} unit</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-bengkel-navy">
                          {formatRupiah(c.totalSpent || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-center text-bengkel-muted text-[11px]">
                          {formatIndonesianDate(c.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openCustomerDetail(c)}
                              className="px-2 py-1 text-xs font-semibold rounded-md border border-gray-200 text-bengkel-navy hover:bg-gray-100 flex items-center gap-1 transition-colors"
                              title="Lihat Detail & Kendaraan"
                            >
                              <Eye className="w-3.5 h-3.5 text-bengkel-orange" />
                              <span>Detail</span>
                            </button>
                            <button
                              onClick={() => setEditingCustomer({ ...c })}
                              className="p-1 text-xs font-semibold rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                              title="Edit Data Pelanggan"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Tambah Pelanggan */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Tambah Data Pelanggan Baru</h3>
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

                <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Contoh: Andi Pratama"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nomor WhatsApp / HP *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="081234567890"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Alamat Email (Opsional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="andi@gmail.com"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Alamat Lengkap
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Jl. Melati No. 5, Jakarta Selatan"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
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
                      {submitting ? "Menyimpan..." : "Simpan Pelanggan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Detail Pelanggan & Garasi Kendaraan */}
          {selectedCustomer && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-bengkel-border space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-bengkel-navy">{selectedCustomer.fullName}</h3>
                    <div className="text-xs text-bengkel-muted mt-0.5">
                      Pelanggan sejak {formatIndonesianDate(selectedCustomer.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Info Kontak & Pengeluaran */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-bengkel-muted font-medium">WhatsApp / Telepon:</span>
                    <div className="font-bold text-bengkel-navy mt-0.5 flex items-center gap-1">
                      <span>{selectedCustomer.phone}</span>
                      <a
                        href={`https://wa.me/${selectedCustomer.phone.replace(/^0/, "62").replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:underline"
                        title="Chat WhatsApp"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-bengkel-muted font-medium">Total Akumulasi Transaksi:</span>
                    <div className="font-bold text-emerald-600 mt-0.5">
                      {formatRupiah(selectedCustomer.totalSpent || 0)}
                    </div>
                  </div>
                  {selectedCustomer.email && (
                    <div className="col-span-2">
                      <span className="text-bengkel-muted font-medium">Email:</span>
                      <div className="font-bold text-bengkel-navy mt-0.5">{selectedCustomer.email}</div>
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div className="col-span-2">
                      <span className="text-bengkel-muted font-medium">Alamat:</span>
                      <div className="text-bengkel-text mt-0.5">{selectedCustomer.address}</div>
                    </div>
                  )}
                </div>

                {/* Garasi Kendaraan Pelanggan */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-bengkel-navy">
                      Unit Kendaraan Terdaftar ({customerVehicles.length})
                    </h4>
                  </div>

                  {customerVehicles.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-bengkel-muted">
                      Belum ada kendaraan yang ditautkan ke pelanggan ini.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customerVehicles.map((v) => (
                        <div
                          key={v.id}
                          className="p-3 rounded-xl border border-bengkel-border bg-white flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-bengkel-navy flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-bengkel-orange" />
                              <span>{v.brand} {v.model}</span>
                            </div>
                            <div className="font-mono text-gray-500 font-bold">{v.licensePlate}</div>
                          </div>
                          <div className="text-right text-[11px] text-bengkel-muted">
                            <div>Tahun: {v.productionYear || "-"}</div>
                            <div>Odo: {v.currentOdometer?.toLocaleString()} km</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end border-t border-gray-100">
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="px-4 py-2 rounded-xl bg-bengkel-navy text-white text-xs font-bold hover:bg-slate-800"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Edit Pelanggan */}
          {editingCustomer && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Edit Data Pelanggan</h3>
                  <button onClick={() => setEditingCustomer(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEditCustomer} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCustomer.fullName}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nomor WhatsApp / HP *
                    </label>
                    <input
                      type="tel"
                      required
                      value={editingCustomer.phone}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      value={editingCustomer.email || ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Alamat Domisili
                    </label>
                    <textarea
                      rows={2}
                      value={editingCustomer.address || ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setEditingCustomer(null)}
                      className="px-3.5 py-2 rounded-lg border border-gray-200 text-bengkel-text hover:bg-gray-50 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-bengkel-orange text-white hover:bg-bengkel-orange-hover font-bold shadow-xs"
                    >
                      {submitting ? "Menyimpan..." : "Simpan Perubahan"}
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
