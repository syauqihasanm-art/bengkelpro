"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { User, Phone, Wrench, Star, ShieldCheck } from "lucide-react";

export default function MechanicProfilePage() {
  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="mechanic" userName="Agus Prasetyo" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Profil Teknisi Mekanik"
          subtitle="Identitas akun staf teknisi dan keahlian spesialisasi bengkel"
          currentRole="mechanic"
        />

        <main className="flex-1 p-6 space-y-6 max-w-3xl w-full mx-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bengkel-border shadow-xs space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-bengkel-navy text-white flex items-center justify-center font-black text-2xl">
                A
              </div>
              <div>
                <h2 className="text-xl font-bold text-bengkel-navy">Agus Prasetyo</h2>
                <p className="text-xs text-bengkel-orange font-bold uppercase tracking-wider mt-0.5">
                  Senior Technician • Bengkel Sahabat Motor
                </p>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span>Rating Kinerja: 4.9 / 5.0 (42 Servis Selesai)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-bengkel-muted font-medium">Nomor WhatsApp:</span>
                <div className="font-bold text-bengkel-navy mt-1">0812-3456-7892</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-bengkel-muted font-medium">Spesialisasi Teknis:</span>
                <div className="font-bold text-bengkel-navy mt-1">Mesin Injeksi & CVT Honda/Yamaha</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-bengkel-muted font-medium">Status Akun:</span>
                <div className="font-bold text-emerald-600 mt-1">Aktif & Terverifikasi</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-bengkel-muted font-medium">Hak Akses Sistem:</span>
                <div className="font-bold text-bengkel-navy mt-1">Pit Servis & Catat Suku Cadang</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
