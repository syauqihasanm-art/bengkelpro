"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { Wrench, ArrowRight, Car, User, Clock } from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

export default function MechanicJobsPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/work-orders")
      .then((res) => res.json())
      .then((data) => setWorkOrders(data.workOrders || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="mechanic" userName="Agus Prasetyo" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Daftar Pekerjaan Mekanik"
          subtitle="Seluruh antrean perbaikan dan inspeksi kendaraan"
          currentRole="mechanic"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workOrders.map((wo) => (
              <div
                key={wo.id}
                className="bg-white rounded-2xl p-5 border border-bengkel-border shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-gray-100 text-bengkel-navy px-2.5 py-1 rounded-md border border-gray-200">
                      {wo.workOrderNumber}
                    </span>
                    <Badge status={wo.status} />
                  </div>

                  <div>
                    <h3 className="font-black text-base text-bengkel-navy">
                      {wo.vehicle?.brand} {wo.vehicle?.model}
                    </h3>
                    <div className="text-xs font-mono font-bold text-bengkel-orange mt-0.5">
                      {wo.vehicle?.licensePlate}
                    </div>
                  </div>

                  <div className="text-xs text-bengkel-muted">
                    Pemilik: <span className="font-semibold text-bengkel-text">{wo.customer?.fullName}</span>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-bengkel-text">
                    <div className="font-bold text-bengkel-navy mb-0.5">Keluhan:</div>
                    <div className="truncate">{wo.customerComplaint}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Odometer: {wo.odometerIn.toLocaleString()} km
                  </span>
                  <Link
                    href={`/mechanic/jobs/${wo.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bengkel-navy hover:bg-bengkel-navy-light text-white text-xs font-bold transition-colors"
                  >
                    <span>Kerjakan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
