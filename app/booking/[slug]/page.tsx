"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  Wrench,
  MapPin,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function PublicBookingPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "sahabat-motor";

  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    vehicleType: "motor",
    brand: "",
    model: "",
    licensePlate: "",
    serviceDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    timeSlot: "09:00 - 10:00",
    complaint: "",
  });

  useEffect(() => {
    // Fetch workshop details
    fetch(`/api/workshops?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.workshop) {
          setWorkshop(data.workshop);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopSlug: slug,
          ...formData,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal membuat jadwal booking.");
      }

      setSuccessCode(json.bookingCode || "BKG-SUCCESS");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const timeSlots = [
    "08:30 - 09:30",
    "09:30 - 10:30",
    "10:30 - 11:30",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:30 - 16:30",
  ];

  return (
    <div className="min-h-screen bg-bengkel-bg flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Workshop Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bengkel-border shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-bengkel-orange text-xs font-bold mb-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>Portal Booking Resmi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-bengkel-navy">
                {workshop?.name || "Bengkel Sahabat Motor"}
              </h1>
              <p className="text-xs sm:text-sm text-bengkel-muted flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{workshop?.address || "Jl. Fatmawati Raya No. 45, Jakarta Selatan"}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-bengkel-green rounded-xl text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Buka Setiap Hari (08:00 - 17:00 WIB)</span>
            </div>
          </div>
        </div>

        {/* Booking Form or Success Confirmation */}
        {successCode ? (
          <div className="bg-white rounded-2xl p-8 border border-emerald-200 shadow-md text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-bengkel-green flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-bengkel-navy">Booking Berhasil Dikonfirmasi!</h2>
            <p className="text-sm text-bengkel-muted max-w-md mx-auto">
              Terima kasih! Jadwal servis kendaraan Anda telah tersimpan di sistem antrean bengkel. Silakan simpan kode booking Anda:
            </p>
            <div className="inline-block px-6 py-3 bg-bengkel-bg rounded-xl border border-bengkel-border font-mono font-black text-xl text-bengkel-orange tracking-wider">
              {successCode}
            </div>
            <div className="text-xs text-bengkel-muted pt-2">
              Harap datang 10 menit sebelum jam servis yang dipilih. Tunjukkan kode ini kepada petugas kasir saat check-in.
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bengkel-border shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-black text-bengkel-navy">Formulir Pendaftaran Servis Mandiri</h2>
              <p className="text-xs text-bengkel-muted mt-0.5">
                Isi data kendaraan dan keluhan untuk mendapatkan nomor antrean servis Anda.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-bengkel-red font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Data Pelanggan */}
              <div>
                <h3 className="text-xs font-bold text-bengkel-orange uppercase tracking-wider mb-3">
                  1. Informasi Pemilik Kendaraan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nomor WhatsApp / HP *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="081234567890"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Data Kendaraan */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-bengkel-orange uppercase tracking-wider mb-3">
                  2. Informasi Kendaraan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Merk *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Honda / Yamaha / Toyota"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Model / Tipe *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Vario 160 / Avanza"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nomor Polisi (Plat) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                      placeholder="B 1234 XYZ"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm uppercase focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Waktu & Keluhan */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-bengkel-orange uppercase tracking-wider mb-3">
                  3. Tanggal, Jam & Keluhan Servis
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Pilih Tanggal Servis *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.serviceDate}
                        onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Pilih Jam Servis *
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                    >
                      {timeSlots.map((ts) => (
                        <option key={ts} value={ts}>{ts} WIB</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Keluhan atau Permintaan Servis *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.complaint}
                      onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                      placeholder="Jelaskan keluhan kendaraan Anda (misal: tarikan berat, rem bunyi, ganti oli mesin dan tune up)..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                    ></textarea>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl text-base font-bold text-white bg-bengkel-orange hover:bg-bengkel-orange-hover shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{submitting ? "Memproses Jadwal..." : "Konfirmasi Booking Servis Sekarang"}</span>
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
