"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Search, Plus, Car, User, Gauge, X, AlertCircle } from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      <Sidebar role="workshop_owner" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Manajemen Kendaraan"
          subtitle="Database motor dan mobil pelanggan dengan rekam odometer"
          currentRole="workshop_owner"
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
                placeholder="Cari plat nomor atau tipe..."
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-bengkel-muted">
                        Memuat data kendaraan...
                      </td>
                    </tr>
                  ) : vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-bengkel-muted">
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
