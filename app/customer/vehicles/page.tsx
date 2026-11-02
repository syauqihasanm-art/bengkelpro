"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Car, Gauge, Plus, Calendar, X, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

const defaultCustomerId = "c1111111-1111-4111-8111-111111111111"; // Rudi Hermawan

export default function CustomerVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    customerId: defaultCustomerId,
    vehicleType: "motor" as "motor" | "mobil" | "truk" | "lainnya",
    brand: "",
    model: "",
    productionYear: 2023,
    licensePlate: "",
    currentOdometer: 10000,
    notes: "",
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      setVehicles(data.vehicles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

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

      setSuccess("Kendaraan Anda berhasil didaftarkan ke garasi!");
      setTimeout(() => setSuccess(""), 4000);
      setModalOpen(false);
      setFormData({
        customerId: defaultCustomerId,
        vehicleType: "motor",
        brand: "",
        model: "",
        productionYear: 2023,
        licensePlate: "",
        currentOdometer: 0,
        notes: "",
      });
      fetchVehicles();
    } catch (err: any) {
      setError(err.message || "Gagal mendaftarkan kendaraan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="customer" userName="Rudi Hermawan" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Garasi Kendaraan Saya"
          subtitle="Daftar motor dan mobil yang terdaftar di akun BengkelPro Anda"
          currentRole="customer"
        />

        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Top Bar with Add Vehicle Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-bengkel-navy">
              <Car className="w-4 h-4 text-bengkel-orange" />
              <span>Garasi Anda: {vehicles.length} Kendaraan Terdaftar</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Daftarkan Kendaraan Baru</span>
            </button>
          </div>

          {/* Vehicles Grid */}
          {loading ? (
            <div className="text-center py-12 text-bengkel-muted text-xs">
              Memuat data garasi kendaraan Anda...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-bengkel-border text-center space-y-3">
              <Car className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-bengkel-navy">Belum Ada Kendaraan di Garasi</h4>
              <p className="text-xs text-bengkel-muted max-w-sm mx-auto">
                Daftarkan sepeda motor atau mobil Anda untuk mempermudah reservasi booking servis dan memantau riwayat perawatan secara digital.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Daftarkan Kendaraan Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl p-6 border border-bengkel-border shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm bg-gray-100 text-bengkel-navy px-3 py-1 rounded-lg border border-gray-200">
                        {v.licensePlate}
                      </span>
                      <span className="text-xs font-semibold capitalize text-bengkel-orange bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                        {v.vehicleType}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-bengkel-navy">{v.brand} {v.model}</h3>
                      <div className="text-xs text-bengkel-muted mt-0.5">Tahun Pembuatan: {v.productionYear || 2023}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-bengkel-muted font-medium">
                        <Gauge className="w-4 h-4 text-bengkel-orange" />
                        <span>Odometer Terakhir:</span>
                      </div>
                      <div className="font-bold text-bengkel-navy text-sm">
                        {v.currentOdometer.toLocaleString()} km
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      Terdaftar: {formatIndonesianDate(v.createdAt)}
                    </span>
                    <Link
                      href="/customer/bookings"
                      className="inline-flex items-center gap-1 text-xs font-bold text-bengkel-orange hover:text-bengkel-orange-hover"
                    >
                      <span>Booking Servis</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Tambah Kendaraan Pelanggan */}
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
                      {submitting ? "Menyimpan..." : "Daftarkan ke Garasi"}
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
