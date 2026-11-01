"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Settings, Save, CheckCircle2 } from "lucide-react";

export default function SuperAdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="super_admin" userName="Super Admin" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Pengaturan Platform Global"
          subtitle="Konfigurasi parameter sistem, rate limiting, dan kebijakan retensi data"
          currentRole="super_admin"
        />

        <main className="flex-1 p-6 space-y-6 max-w-4xl w-full mx-auto">
          {saved && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-bengkel-green font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pengaturan platform berhasil diperbarui!</span>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bengkel-border shadow-xs space-y-6">
            <h3 className="text-base font-bold text-bengkel-navy border-b border-gray-100 pb-3">
              Kebijakan Retensi & Perlindungan Data Pribadi (PDP)
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="font-bold text-bengkel-navy">Zona Waktu Default:</span>
                <div className="text-bengkel-muted">Asia/Jakarta (WIB) — Digunakan untuk seluruh log transaksi dan antrean.</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="font-bold text-bengkel-navy">Mata Uang Acuan:</span>
                <div className="text-bengkel-muted">IDR (Indonesian Rupiah) — Format desimal numerik presisi tanpa pembulatan mengambang.</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="font-bold text-bengkel-navy">Audit Log Retention:</span>
                <div className="text-bengkel-muted">Jejak mutasi stok dan pembayaran kasir disimpan minimal 5 tahun sesuai regulasi elektronik.</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                }}
                className="px-6 py-2.5 rounded-xl bg-bengkel-orange hover:bg-bengkel-orange-hover text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Kebijakan Platform</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
