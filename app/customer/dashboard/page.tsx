"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Badge } from "@/components/Badge";
import { Car, CalendarCheck, History, Receipt, Plus, ArrowRight, Wrench } from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export default function CustomerDashboardPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/vehicles"),
      fetch("/api/bookings"),
      fetch("/api/work-orders"),
      fetch("/api/invoices"),
    ])
      .then(async ([vRes, bRes, wRes, iRes]) => {
        const vData = await vRes.json();
        const bData = await bRes.json();
        const wData = await wRes.json();
        const iData = await iRes.json();

        setVehicles(vData.vehicles || []);
        setBookings(bData.bookings || []);
        setWorkOrders(wData.workOrders || []);
        setInvoices(iData.invoices || []);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="customer" userName="Rudi Hermawan" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Portal Pemilik Kendaraan"
          subtitle="Pantau status servis motor/mobil Anda secara langsung dan transparan"
          currentRole="customer"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Quick Stats for Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatsCard
              title="Kendaraan Terdaftar"
              value={`${vehicles.length} Unit`}
              description="Motor & Mobil Pribadi"
              icon={<Car className="w-5 h-5" />}
              variant="navy"
            />
            <StatsCard
              title="Servis Berjalan (Live)"
              value={workOrders.filter((w) => w.status !== "completed").length}
              description="Sedang di pit bengkel"
              icon={<Wrench className="w-5 h-5" />}
              variant="orange"
            />
            <StatsCard
              title="Booking Terjadwal"
              value={bookings.length}
              description="Reservasi aktif"
              icon={<CalendarCheck className="w-5 h-5" />}
              variant="green"
            />
            <StatsCard
              title="Tagihan Belum Bayar"
              value={invoices.filter((i) => i.status !== "paid").length}
              description="Faktur kasir"
              icon={<Receipt className="w-5 h-5" />}
              variant="red"
            />
          </div>

          {/* Live Service Progress Banner */}
          {workOrders.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border-2 border-bengkel-orange shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-bengkel-orange uppercase tracking-wider">
                    Progress Servis Kendaraan Anda Saat Ini
                  </span>
                </div>
                <Badge status={workOrders[0].status} />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-bengkel-navy">
                    {workOrders[0].vehicle?.brand} {workOrders[0].vehicle?.model} ({workOrders[0].vehicle?.licensePlate})
                  </h3>
                  <p className="text-xs text-bengkel-muted mt-1">
                    Keluhan: {workOrders[0].customerComplaint}
                  </p>
                  {workOrders[0].inspectionFindings && (
                    <p className="text-xs text-bengkel-text font-semibold mt-0.5">
                      Temuan Mekanik: {workOrders[0].inspectionFindings}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm text-bengkel-muted font-medium">Estimasi Biaya:</div>
                  <div className="text-xl font-black text-bengkel-navy">
                    {formatRupiah(workOrders[0].grandTotal)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/customer/bookings"
              className="p-5 bg-white rounded-2xl border border-bengkel-border shadow-xs hover:border-bengkel-orange hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-base text-bengkel-navy">Booking Servis Baru</h4>
                <p className="text-xs text-bengkel-muted mt-0.5">Pilih jam servis tanpa perlu antre lama di bengkel</p>
              </div>
              <ArrowRight className="w-5 h-5 text-bengkel-orange" />
            </Link>

            <Link
              href="/customer/service-history"
              className="p-5 bg-white rounded-2xl border border-bengkel-border shadow-xs hover:border-bengkel-orange hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-base text-bengkel-navy">Buku Servis Digital</h4>
                <p className="text-xs text-bengkel-muted mt-0.5">Catatan pergantian oli dan part kendaraan Anda</p>
              </div>
              <History className="w-5 h-5 text-bengkel-orange" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
