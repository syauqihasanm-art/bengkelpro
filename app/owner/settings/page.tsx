"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Building2, Save, ExternalLink, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/workshops?slug=sahabat-motor")
      .then((res) => res.json())
      .then((data) => setWorkshop(data.workshop))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="workshop_owner" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Pengaturan Bengkel"
          subtitle="Profil identitas bengkel, jam operasional, dan kapasitas kuota harian"
          currentRole="workshop_owner"
        />

        <main className="flex-1 p-6 space-y-6 max-w-4xl w-full mx-auto">
          {saved && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-bengkel-green font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pengaturan bengkel berhasil diperbarui!</span>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bengkel-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-bengkel-navy">Profil Bengkel & Operasional</h2>
                <p className="text-xs text-bengkel-muted">Informasi ini ditampilkan pada faktur cetak dan formulir booking publik.</p>
              </div>

              {workshop?.slug && (
                <Link
                  href={`/booking/${workshop.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-bengkel-navy hover:bg-gray-50 transition-colors"
                >
                  <span>Buka Web Booking</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                    Nama Bengkel *
                  </label>
                  <input
                    type="text"
                    defaultValue={workshop?.name || "Bengkel Sahabat Motor"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                  />
                </div>

                <div>
                  <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                    Nomor WhatsApp Kasir *
                  </label>
                  <input
                    type="tel"
                    defaultValue={workshop?.phone || "081234567890"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                    Alamat Lengkap Bengkel *
                  </label>
                  <input
                    type="text"
                    defaultValue={workshop?.address || "Jl. Fatmawati Raya No. 45"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                  />
                </div>

                <div>
                  <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                    Kota / Kabupaten *
                  </label>
                  <input
                    type="text"
                    defaultValue={workshop?.city || "Jakarta Selatan"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                  />
                </div>

                <div>
                  <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                    Kapasitas Servis per Hari (Slot) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    defaultValue={workshop?.capacityPerDay || 20}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange font-bold text-bengkel-navy"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-bengkel-orange hover:bg-bengkel-orange-hover text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
