"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { Calendar, Clock, CheckCircle2, XCircle, PlayCircle, Plus, X, AlertCircle } from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

export interface BookingsViewProps {
  role?: "workshop_owner" | "workshop_admin";
  userName?: string;
}

export function BookingsView({
  role = "workshop_owner",
  userName = "Budi Santoso",
}: BookingsViewProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
    vehicleId: "",
    serviceDate: new Date().toISOString().split("T")[0],
    timeSlot: "09:00 - 10:00",
    customerComplaint: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bkgRes, custRes, vehRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/customers"),
        fetch("/api/vehicles"),
      ]);

      const bkgData = await bkgRes.json();
      const custData = await custRes.json();
      const vehData = await vehRes.json();

      setBookings(bkgData.bookings || []);
      setCustomers(custData.customers || []);
      setVehicles(vehData.vehicles || []);

      if (custData.customers?.length > 0 && !formData.customerId) {
        setFormData((prev) => ({
          ...prev,
          customerId: custData.customers[0].id,
          vehicleId: vehData.vehicles?.[0]?.id || "",
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formData.customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId: "11111111-1111-4111-8111-111111111111",
          ...formData,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat jadwal booking.");

      setModalOpen(false);
      setFormData({
        customerId: customers[0]?.id || "",
        vehicleId: vehicles[0]?.id || "",
        serviceDate: new Date().toISOString().split("T")[0],
        timeSlot: "09:00 - 10:00",
        customerComplaint: "",
      });
      fetchData();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role={role} userName={userName} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Booking & Antrean Servis"
          subtitle="Kelola reservasi jadwal servis dan kuota harian bengkel"
          currentRole={role}
          userName={userName}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="text-xs text-bengkel-muted">
              Total Reservasi Terdaftar: <span className="font-bold text-bengkel-navy">{bookings.length}</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Reservasi Manual</span>
            </button>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Kode Booking</th>
                    <th className="py-3 px-4">Jadwal & Waktu</th>
                    <th className="py-3 px-4">Pelanggan & Kendaraan</th>
                    <th className="py-3 px-4">Keluhan Pelanggan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-bengkel-muted">
                        Memuat data antrean booking...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-bengkel-muted">
                        Belum ada reservasi booking servis.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-xs text-bengkel-orange bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
                            {b.bookingCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-bengkel-navy flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{formatIndonesianDate(b.serviceDate)}</span>
                          </div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{b.timeSlot} WIB</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-bengkel-navy">{b.customer?.fullName}</div>
                          <div className="text-[11px] text-bengkel-muted">
                            {b.vehicle?.brand} {b.vehicle?.model} ({b.vehicle?.licensePlate})
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-bengkel-muted max-w-xs truncate">
                          {b.customerComplaint}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge status={b.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(b.id, "confirmed")}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                                >
                                  Konfirmasi
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(b.id, "rejected")}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                            {b.status === "confirmed" && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "checked_in")}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              >
                                Check-in
                              </button>
                            )}
                            {b.status === "checked_in" && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "in_service")}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                              >
                                Masuk Servis
                              </button>
                            )}
                            {b.status === "in_service" && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "completed")}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                              >
                                Selesai
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

          {/* Modal Tambah Booking */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Tambah Reservasi Booking Baru</h3>
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
                      Pilih Pelanggan *
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

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Pilih Kendaraan *
                    </label>
                    <select
                      required
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs bg-white"
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.licensePlate} — {v.brand} {v.model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Tanggal Servis *
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
                        Jam Servis *
                      </label>
                      <select
                        value={formData.timeSlot}
                        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs bg-white"
                      >
                        <option value="08:30 - 09:30">08:30 - 09:30</option>
                        <option value="09:30 - 10:30">09:30 - 10:30</option>
                        <option value="10:30 - 11:30">10:30 - 11:30</option>
                        <option value="13:00 - 14:00">13:00 - 14:00</option>
                        <option value="14:00 - 15:00">14:00 - 15:00</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Keluhan Kendaraan *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.customerComplaint}
                      onChange={(e) => setFormData({ ...formData, customerComplaint: e.target.value })}
                      placeholder="Jelaskan keluhan servis..."
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
                      {submitting ? "Menyimpan..." : "Simpan Booking"}
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
