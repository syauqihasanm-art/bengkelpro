"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { Calendar, Clock, CheckCircle2, ArrowRight, Plus, X, AlertCircle } from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";
const defaultCustomerId = "c1111111-1111-4111-8111-111111111111";

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    workshopId: defaultWorkshopId,
    customerId: defaultCustomerId,
    vehicleId: "",
    serviceDate: new Date().toISOString().split("T")[0],
    timeSlot: "09:00 - 10:00",
    customerComplaint: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bkgRes, vehRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/vehicles"),
      ]);

      const bkgData = await bkgRes.json();
      const vehData = await vehRes.json();

      setBookings(bkgData.bookings || []);
      setVehicles(vehData.vehicles || []);

      if (vehData.vehicles?.length > 0 && !formData.vehicleId) {
        setFormData((prev) => ({ ...prev, vehicleId: vehData.vehicles[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formData.vehicleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat reservasi booking.");

      setSuccess("Reservasi booking servis Anda berhasil dijadwalkan!");
      setTimeout(() => setSuccess(""), 4000);
      setModalOpen(false);
      setFormData((prev) => ({
        ...prev,
        customerComplaint: "",
      }));
      fetchData();
    } catch (err: any) {
      setError(err.message || "Gagal membuat jadwal booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="customer" userName="Rudi Hermawan" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Booking Servis Kendaraan"
          subtitle="Jadwal reservasi kedatangan Anda di bengkel mitra BengkelPro"
          currentRole="customer"
        />

        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-bengkel-navy">
              <Calendar className="w-4 h-4 text-bengkel-orange" />
              <span>Jadwal Antrean Booking Servis Anda ({bookings.length})</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Reservasi Booking Baru</span>
            </button>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="text-center py-12 text-bengkel-muted text-xs">
              Memuat data reservasi booking...
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-bengkel-border text-center space-y-3">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-bengkel-navy">Belum Ada Jadwal Booking</h4>
              <p className="text-xs text-bengkel-muted max-w-sm mx-auto">
                Pesan slot servis lebih awal tanpa antre lama saat tiba di bengkel.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Booking Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-6 border border-bengkel-border shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-orange-50 text-bengkel-orange px-2.5 py-1 rounded-md border border-orange-200">
                        {b.bookingCode}
                      </span>
                      <Badge status={b.status} />
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-bengkel-navy">
                        {b.vehicle?.brand} {b.vehicle?.model} ({b.vehicle?.licensePlate})
                      </h3>
                      <p className="text-xs text-bengkel-muted mt-0.5">Keluhan: {b.customerComplaint}</p>
                    </div>
                  </div>

                  <div className="sm:text-right space-y-1 text-xs">
                    <div className="font-bold text-bengkel-navy flex items-center gap-1 sm:justify-end">
                      <Calendar className="w-3.5 h-3.5 text-bengkel-orange" />
                      <span>{formatIndonesianDate(b.serviceDate)}</span>
                    </div>
                    <div className="text-gray-500 flex items-center gap-1 sm:justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pukul {b.timeSlot} WIB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Buat Booking */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Buat Reservasi Servis Baru</h3>
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

                <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Pilih Kendaraan Anda *
                    </label>
                    <select
                      required
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs bg-white"
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.brand} {v.model} ({v.licensePlate})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Tanggal Kedatangan *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.serviceDate}
                        onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Sesi Jam (Slot) *
                      </label>
                      <select
                        value={formData.timeSlot}
                        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs bg-white"
                      >
                        <option value="08:00 - 09:00">08:00 - 09:00</option>
                        <option value="09:00 - 10:00">09:00 - 10:00</option>
                        <option value="10:00 - 11:00">10:00 - 11:00</option>
                        <option value="11:00 - 12:00">11:00 - 12:00</option>
                        <option value="13:00 - 14:00">13:00 - 14:00</option>
                        <option value="14:00 - 15:00">14:00 - 15:00</option>
                        <option value="15:00 - 16:00">15:00 - 16:00</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Keluhan / Kebutuhan Servis *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.customerComplaint}
                      onChange={(e) => setFormData({ ...formData, customerComplaint: e.target.value })}
                      placeholder="Contoh: Ganti oli mesin & filter, cek kampas rem depan bunyi mendecit..."
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
                      {submitting ? "Memproses..." : "Konfirmasi Booking"}
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
