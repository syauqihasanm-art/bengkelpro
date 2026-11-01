"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { UserCheck, Plus, Star, Phone, Wrench, X, AlertCircle } from "lucide-react";

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    specialization: "Spesialis Injeksi & Mesin Matic",
    status: "active" as any,
  });

  const fetchMechanics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mechanics");
      const data = await res.json();
      setMechanics(data.mechanics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const handleCreateMechanic = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/mechanics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah mekanik.");

      setModalOpen(false);
      setFormData({ name: "", phone: "", specialization: "", status: "active" });
      fetchMechanics();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan mekanik.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="workshop_owner" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Tim Teknisi & Mekanik"
          subtitle="Daftar teknisi servis, spesialisasi keahlian, dan metrik performa pekerjaan"
          currentRole="workshop_owner"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="text-xs text-bengkel-muted">
              Total Mekanik Terdaftar: <span className="font-bold text-bengkel-navy">{mechanics.length} Orang</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mekanik Baru</span>
            </button>
          </div>

          {/* Mechanics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mechanics.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-6 border border-bengkel-border shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-bengkel-navy text-white flex items-center justify-center font-bold text-base">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-bengkel-navy">{m.name}</h3>
                      <div className="text-xs text-bengkel-muted">{m.specialization}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{m.rating || "5.0"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-bengkel-muted">Tugas Aktif</div>
                    <div className="font-bold text-bengkel-navy text-sm mt-0.5">{m.activeJobsCount || 0} SPK</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-bengkel-muted">Servis Selesai</div>
                    <div className="font-bold text-bengkel-green text-sm mt-0.5">{m.completedJobsCount || 0} unit</div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs text-bengkel-text">
                  <Phone className="w-3.5 h-3.5 text-bengkel-orange" />
                  <span>{m.phone}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Tambah Mekanik */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Tambah Mekanik Baru</h3>
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

                <form onSubmit={handleCreateMechanic} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nama Lengkap Mekanik *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Agus Pratama"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nomor HP / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="081234567890"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Spesialisasi Keahlian *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="Spesialis Mesin 4-Tak / CVT / Injeksi"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
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
                      {submitting ? "Menyimpan..." : "Simpan Mekanik"}
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
