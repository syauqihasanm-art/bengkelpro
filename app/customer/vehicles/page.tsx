"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Car, Gauge, Plus, Calendar } from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

export default function CustomerVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => setVehicles(data.vehicles || []))
      .catch(console.error);
  }, []);

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="customer" userName="Rudi Hermawan" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Kendaraan Saya"
          subtitle="Daftar motor dan mobil yang terdaftar di akun BengkelPro Anda"
          currentRole="customer"
        />

        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl p-6 border border-bengkel-border shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
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
                  <div className="text-xs text-bengkel-muted mt-0.5">Tahun: {v.productionYear || 2023}</div>
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
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
