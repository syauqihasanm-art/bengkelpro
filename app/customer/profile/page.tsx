"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { User, Phone, Mail, MapPin } from "lucide-react";

export default function CustomerProfilePage() {
  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="customer" userName="Rudi Hermawan" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Profil Akun Pelanggan"
          subtitle="Data kontak dan informasi pemilik kendaraan"
          currentRole="customer"
        />

        <main className="flex-1 p-6 space-y-6 max-w-3xl w-full mx-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bengkel-border shadow-xs space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-bengkel-orange text-white flex items-center justify-center font-black text-2xl">
                R
              </div>
              <div>
                <h2 className="text-xl font-bold text-bengkel-navy">Rudi Hermawan</h2>
                <p className="text-xs text-bengkel-muted mt-0.5">Pelanggan Bengkel Terverifikasi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-bengkel-muted font-medium">Nomor WhatsApp:</span>
                <div className="font-bold text-bengkel-navy mt-1">0812-9876-5432</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-bengkel-muted font-medium">Email:</span>
                <div className="font-bold text-bengkel-navy mt-1">pelanggan@gmail.com</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                <span className="text-bengkel-muted font-medium">Alamat:</span>
                <div className="font-bold text-bengkel-navy mt-1">Jl. Cilandak Barat No. 12, Jakarta Selatan</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
