"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Badge } from "@/components/Badge";
import { Wrench, CheckCircle2, Clock, Car, ArrowRight, Play } from "lucide-react";

export default function MechanicDashboardPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/work-orders")
      .then((res) => res.json())
      .then((data) => setWorkOrders(data.workOrders || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const activeJobs = workOrders.filter((w) => ["waiting", "inspection", "in_progress", "waiting_parts"].includes(w.status));
  const completedJobs = workOrders.filter((w) => ["completed", "delivered"].includes(w.status));

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="mechanic" userName="Agus Prasetyo" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Portal Teknisi & Mekanik"
          subtitle="Daftar pekerjaan aktif di pit servis, inspeksi kendaraan, dan pemakaian spare part"
          currentRole="mechanic"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* KPI Cards for Mechanic */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              title="Pekerjaan Aktif Ditugaskan"
              value={activeJobs.length}
              description="Kendaraan yang sedang ditangani saat ini"
              icon={<Wrench className="w-5 h-5" />}
              variant="orange"
            />
            <StatsCard
              title="Servis Selesai Bulan Ini"
              value={completedJobs.length}
              description="Pekerjaan tuntas dengan hasil QA baik"
              icon={<CheckCircle2 className="w-5 h-5" />}
              variant="green"
            />
            <StatsCard
              title="Rating Kepuasan Servis"
              value="4.9 / 5.0"
              description="Berdasarkan umpan balik pelanggan bengkel"
              icon={<Clock className="w-5 h-5" />}
              variant="navy"
            />
          </div>

          {/* Active Work Orders for Mechanic */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-bengkel-navy">Tugas Perbaikan Aktif Anda</h3>
                <p className="text-xs text-bengkel-muted">Pilih kendaraan untuk melihat rincian keluhan dan input suku cadang</p>
              </div>
              <Link href="/mechanic/jobs" className="text-xs font-bold text-bengkel-orange hover:underline">
                Lihat Seluruh Tugas
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeJobs.map((wo) => (
                <div
                  key={wo.id}
                  className="p-4 rounded-xl border border-bengkel-border bg-gray-50/50 hover:bg-white hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-bengkel-navy bg-white px-2.5 py-1 rounded-md border border-gray-200">
                      {wo.workOrderNumber}
                    </span>
                    <Badge status={wo.status} />
                  </div>

                  <div>
                    <div className="font-bold text-sm text-bengkel-navy">
                      {wo.vehicle?.brand} {wo.vehicle?.model} ({wo.vehicle?.licensePlate})
                    </div>
                    <div className="text-xs text-bengkel-muted mt-0.5">
                      Pemilik: {wo.customer?.fullName} • Odometer: {wo.odometerIn} km
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-gray-200 text-xs">
                    <span className="font-bold text-bengkel-navy">Keluhan: </span>
                    <span className="text-bengkel-text">{wo.customerComplaint}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      Item Terdaftar: {wo.items?.length || 0} part & jasa
                    </span>
                    <Link
                      href={`/mechanic/jobs/${wo.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover transition-colors"
                    >
                      <span>Buka Tugas Servis</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
