"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Building2, Save, ExternalLink, CheckCircle2 } from "lucide-react";

export interface SettingsViewProps {
  role?: "workshop_owner" | "workshop_admin";
  userName?: string;
}

export function SettingsView({
  role = "workshop_owner",
  userName = "Budi Santoso",
}: SettingsViewProps) {
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: "Bengkel Sahabat Motor",
    phone: "081234567890",
    address: "Jl. Fatmawati Raya No. 45",
    city: "Jakarta Selatan",
    capacityPerDay: 20,
  });

  useEffect(() => {
    fetch("/api/workshops?slug=sahabat-motor")
      .then((res) => res.json())
      .then((data) => {
        if (data.workshop) {
          setWorkshop(data.workshop);
          setFormData({
            name: data.workshop.name || "Bengkel Sahabat Motor",
            phone: data.workshop.phone || "081234567890",
            address: data.workshop.address || "Jl. Fatmawati Raya No. 45",
            city: data.workshop.city || "Jakarta Selatan",
            capacityPerDay: data.workshop.capacityPerDay || 20,
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshop?.id) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workshops", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: workshop.id,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          capacityPerDay: Number(formData.capacityPerDay),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.workshop) {
          setWorkshop(data.workshop);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update workshop:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role={role} userName={userName} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Pengaturan Bengkel"
          subtitle="Profil identitas bengkel, jam operasional, dan kapasitas kuota harian"
          currentRole={role}
          userName={userName}
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                  />
                </div>

                <div>
                  <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                    Nomor WhatsApp Kasir *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                    Alamat Lengkap Bengkel *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                  />
                </div>

                <div>
                  <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                    Kota / Kabupaten *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
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
                    value={formData.capacityPerDay}
                    onChange={(e) => setFormData({ ...formData, capacityPerDay: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange font-bold text-bengkel-navy"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-bengkel-orange hover:bg-bengkel-orange-hover text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
