"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  Search, Plus, Car, User, Gauge, X, AlertCircle, 
  Eye, Edit, Calendar, FileText, CheckCircle2, History, Wrench
} from "lucide-react";
import { formatIndonesianDate, formatRupiah } from "@/lib/utils";

export interface VehiclesViewProps {
  role?: "workshop_owner" | "workshop_admin";
  userName?: string;
}

export function VehiclesView({
  role = "workshop_owner",
  userName = "Budi Santoso",
}: VehiclesViewProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // History / Buku Servis Modal state
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [vehicleHistory, setVehicleHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Edit Modal state
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    vehicleType: "motor" as "motor" | "mobil" | "truk" | "lainnya",
    brand: "",
    model: "",
    productionYear: 2023,
    licensePlate: "",
    currentOdometer: 0,
    notes: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
    vehicleType: "motor" as "motor" | "mobil" | "truk" | "lainnya",
    brand: "",
    model: "",
    productionYear: 2023,
    licensePlate: "",
    currentOdometer: 10000,
    notes: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vehRes, custRes] = await Promise.all([
        fetch(`/api/vehicles?search=${encodeURIComponent(search)}`),
        fetch("/api/customers"),
      ]);

      const vehData = await vehRes.json();
      const custData = await custRes.json();

      setVehicles(vehData.vehicles || []);
      setCustomers(custData.customers || []);
      if (custData.customers?.length > 0 && !formData.customerId) {
        setFormData((prev) => ({ ...prev, customerId: custData.customers[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, formData.customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Buku Servis & fetch historical Work Orders
  const openBukuServis = async (v: any) => {
    setSelectedVehicle(v);
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/work-orders");
      const data = await res.json();
      const wos = (data.workOrders || []).filter(
        (wo: any) => wo.vehicleId === v.id || wo.vehicle?.licensePlate === v.licensePlate
      );
      setVehicleHistory(wos);
    } catch (err) {
      console.error("Gagal memuat histori servis:", err);
      setVehicleHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (v: any) => {
    setEditingVehicle(v);
    setEditError("");
    setEditFormData({
      vehicleType: v.vehicleType || "motor",
      brand: v.brand || "",
      model: v.model || "",
      productionYear: v.productionYear || 2023,
      licensePlate: v.licensePlate || "",
      currentOdometer: v.currentOdometer || 0,
      notes: v.notes || "",
    });
  };

  const handleEditVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    setEditError("");
    setEditSubmitting(true);

    try {
      const res = await fetch("/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingVehicle.id,
          ...editFormData,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui kendaraan.");

      setEditingVehicle(null);
      fetchData();
    } catch (err: any) {
      setEditError(err.message || "Gagal memperbarui kendaraan.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mendaftarkan kendaraan.");

      setModalOpen(false);
      setFormData({
        customerId: customers[0]?.id || "",
        vehicleType: "motor",
        brand: "",
        model: "",
        productionYear: 2023,
        licensePlate: "",
        currentOdometer: 0,
        notes: "",
      });
      fetchData();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data kendaraan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role={role} userName={userName} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Manajemen Kendaraan"
          subtitle="Database motor dan mobil pelanggan dengan rekam odometer & buku servis digital"
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
                placeholder="Cari plat nomor atau merk..."
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange uppercase"
              />
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Kendaraan Baru</span>
            </button>
          </div>

          {/* Vehicles Table */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Plat Nomor</th>
                    <th className="py-3 px-4">Tipe & Merk</th>
                    <th className="py-3 px-4">Pemilik (Customer)</th>
                    <th className="py-3 px-4 text-center">Tahun</th>
                    <th className="py-3 px-4 text-right">Odometer Terakhir</th>
                    <th className="py-3 px-4 text-center">Terdaftar</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                        Memuat data kendaraan...
                      </td>
                    </tr>
                  ) : vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                        Tidak ada kendaraan ditemukan.
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-xs bg-gray-100 px-2.5 py-1 rounded-md text-bengkel-navy border border-gray-200">
                            {v.licensePlate}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-bengkel-navy">{v.brand} {v.model}</div>
                          <div className="text-[11px] text-gray-400 capitalize">{v.vehicleType}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-bengkel-text">{v.customer?.fullName || "-"}</div>
                          <div className="text-[11px] text-gray-400">{v.customer?.phone || ""}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center text-bengkel-muted">
                          {v.productionYear || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1 font-bold text-bengkel-navy">
                            <Gauge className="w-3.5 h-3.5 text-bengkel-orange" />
                            <span>{v.currentOdometer.toLocaleString()} km</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center text-bengkel-muted text-[11px]">
                          {formatIndonesianDate(v.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openBukuServis(v)}
                              title="Buku Servis & Histori"
                              className="p-1.5 rounded-lg border border-bengkel-border text-bengkel-navy hover:bg-gray-100 transition-colors font-medium text-xs flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              <span className="hidden sm:inline">Buku Servis</span>
                            </button>
                            <button
                              onClick={() => openEditModal(v)}
                              title="Edit Data Kendaraan"
                              className="p-1.5 rounded-lg border border-bengkel-border text-bengkel-text hover:bg-gray-100 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 text-bengkel-orange" />
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

          {/* Modal Buku Servis & Histori Kendaraan */}
          {selectedVehicle && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-bengkel-border space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-bengkel-navy">
                        Buku Servis Digital: {selectedVehicle.licensePlate}
                      </h3>
                      <p className="text-xs text-bengkel-muted">
                        {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.productionYear || "Tahun tidak dicatat"})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Specs Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Pemilik:</span>
                    <span className="font-bold text-bengkel-navy">{selectedVehicle.customer?.fullName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Telepon:</span>
                    <span className="font-semibold text-bengkel-text">{selectedVehicle.customer?.phone || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Odometer:</span>
                    <span className="font-bold text-bengkel-navy">{selectedVehicle.currentOdometer.toLocaleString()} km</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Jenis:</span>
                    <span className="font-semibold text-bengkel-text capitalize">{selectedVehicle.vehicleType}</span>
                  </div>
                </div>

                {/* Service History Timeline */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-bengkel-navy flex items-center gap-1.5">
                      <History className="w-4 h-4 text-bengkel-orange" />
                      <span>Riwayat Servis & Perbaikan ({vehicleHistory.length})</span>
                    </h4>
                  </div>

                  {loadingHistory ? (
                    <div className="text-center py-8 text-bengkel-muted text-xs">
                      Memuat riwayat servis kendaraan...
                    </div>
                  ) : vehicleHistory.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-gray-50 border border-dashed border-gray-200">
                      <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-bengkel-muted font-medium">
                        Belum ada riwayat servis atau perbaikan yang tercatat untuk kendaraan ini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vehicleHistory.map((wo: any) => (
                        <div
                          key={wo.id}
                          className="p-4 rounded-xl border border-bengkel-border bg-white shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-bengkel-navy bg-orange-50 text-bengkel-orange px-2 py-0.5 rounded border border-orange-200">
                                {wo.workOrderNumber}
                              </span>
                              <span className="text-gray-400">|</span>
                              <span className="text-bengkel-muted flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatIndonesianDate(wo.createdAt)}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              wo.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : wo.status === "in_progress"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {wo.status}
                            </span>
                          </div>

                          <div className="text-xs text-bengkel-text">
                            <span className="font-bold text-bengkel-navy">Keluhan: </span>
                            {wo.customerComplaint || "Servis rutin"}
                          </div>

                          {wo.items && wo.items.length > 0 && (
                            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-[11px] space-y-1">
                              <div className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Tindakan & Sparepart:</div>
                              {wo.items.map((it: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-gray-700">
                                  <span>• {it.name} ({it.quantity}x)</span>
                                  <span className="font-mono">{formatRupiah(it.unitPrice * it.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                            <span className="text-[11px] text-gray-400">
                              Odometer Masuk: <strong className="text-bengkel-navy">{wo.odometerIn || selectedVehicle.currentOdometer} km</strong>
                            </span>
                            <div className="text-right">
                              <span className="text-[11px] text-gray-400 mr-2">Total Biaya:</span>
                              <span className="font-mono font-bold text-bengkel-navy">
                                {formatRupiah(wo.totalAmount || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end border-t border-gray-100">
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-bengkel-text hover:bg-gray-200 font-bold text-xs"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Edit Kendaraan */}
          {editingVehicle && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Edit Data Kendaraan</h3>
                  <button onClick={() => setEditingVehicle(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {editError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-bengkel-red flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}

                <form onSubmit={handleEditVehicle} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Jenis Kendaraan *
                      </label>
                      <select
                        value={editFormData.vehicleType}
                        onChange={(e) => setEditFormData({ ...editFormData, vehicleType: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs bg-white"
                      >
                        <option value="motor">Sepeda Motor</option>
                        <option value="mobil">Mobil</option>
                        <option value="truk">Truk / Niaga</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Nomor Polisi (Plat) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.licensePlate}
                        onChange={(e) => setEditFormData({ ...editFormData, licensePlate: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Merk Kendaraan *
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.brand}
                        onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Model / Tipe *
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.model}
                        onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Tahun Pembuatan
                      </label>
                      <input
                        type="number"
                        value={editFormData.productionYear}
                        onChange={(e) => setEditFormData({ ...editFormData, productionYear: parseInt(e.target.value) || 2023 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Odometer Saat Ini (km) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={editFormData.currentOdometer}
                        onChange={(e) => setEditFormData({ ...editFormData, currentOdometer: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Catatan Tambahan
                    </label>
                    <textarea
                      rows={2}
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      placeholder="Warna kendaraan, nomor rangka, atau modifikasi khusus..."
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setEditingVehicle(null)}
                      className="px-3.5 py-2 rounded-lg border border-gray-200 text-bengkel-text hover:bg-gray-50 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={editSubmitting}
                      className="px-4 py-2 rounded-lg bg-bengkel-orange text-white hover:bg-bengkel-orange-hover font-bold shadow-xs"
                    >
                      {editSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Tambah Kendaraan */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Daftarkan Kendaraan Baru</h3>
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

                <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Pilih Pemilik (Customer) *
                    </label>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs bg-white"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Jenis Kendaraan *
                      </label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs bg-white"
                      >
                        <option value="motor">Sepeda Motor</option>
                        <option value="mobil">Mobil</option>
                        <option value="truk">Truk / Niaga</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Nomor Polisi (Plat) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.licensePlate}
                        onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                        placeholder="B 1234 XYZ"
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Merk Kendaraan *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Honda / Yamaha"
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Model / Tipe *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="Vario 160 / NMAX"
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Tahun Pembuatan
                      </label>
                      <input
                        type="number"
                        value={formData.productionYear}
                        onChange={(e) => setFormData({ ...formData, productionYear: parseInt(e.target.value) || 2023 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Odometer Saat Ini (km) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={formData.currentOdometer}
                        onChange={(e) => setFormData({ ...formData, currentOdometer: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                      />
                    </div>
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
                      {submitting ? "Menyimpan..." : "Daftarkan Kendaraan"}
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
