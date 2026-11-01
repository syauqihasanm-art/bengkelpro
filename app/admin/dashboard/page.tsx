"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Badge } from "@/components/Badge";
import {
  CalendarCheck,
  Wrench,
  Receipt,
  Users,
  Plus,
  RefreshCw,
  ArrowRight,
  Package,
} from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [woRes, bkgRes, invRes] = await Promise.all([
        fetch("/api/work-orders"),
        fetch("/api/bookings"),
        fetch("/api/invoices"),
      ]);

      const woData = await woRes.json();
      const bkgData = await bkgRes.json();
      const invData = await invRes.json();

      setWorkOrders(woData.workOrders || []);
      setBookings(bkgData.bookings || []);
      setInvoices(invData.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const activeRepairs = workOrders.filter((w) => ["waiting", "inspection", "in_progress"].includes(w.status)).length;
  const unpaidInvoices = invoices.filter((i) => i.status === "unpaid" || i.status === "partially_paid").length;

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="workshop_admin" userName="Dewi Lestari" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Dashboard Kasir & Operasional"
          subtitle="Penerimaan antrean pelanggan, pembuatan SPK, dan kasir pembayaran"
          currentRole="workshop_admin"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Quick Actions for Admin */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-bengkel-navy uppercase tracking-wider">Aksi Cepat Kasir:</span>
              <Link
                href="/admin/work-orders"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat SPK Baru</span>
              </Link>
              <Link
                href="/admin/invoices"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bengkel-bg border border-bengkel-border text-bengkel-navy text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                <Receipt className="w-3.5 h-3.5 text-bengkel-orange" />
                <span>Buka Kasir Faktur</span>
              </Link>
            </div>

            <button
              onClick={fetchData}
              className="p-1.5 text-bengkel-muted hover:text-bengkel-navy hover:bg-gray-100 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* KPI Cards for Workshop Admin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              title="Antrean Booking Masuk"
              value={pendingBookings}
              description="Perlu konfirmasi jadwal atau check-in"
              icon={<CalendarCheck className="w-5 h-5" />}
              variant="orange"
            />
            <StatsCard
              title="Kendaraan Dikerjakan (SPK)"
              value={activeRepairs}
              description="Sedang diinspeksi atau di pit servis"
              icon={<Wrench className="w-5 h-5" />}
              variant="navy"
            />
            <StatsCard
              title="Tagihan Belum Lunas"
              value={unpaidInvoices}
              description="Faktur yang menunggu pembayaran kasir"
              icon={<Receipt className="w-5 h-5" />}
              variant="red"
            />
          </div>

          {/* Operational Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Queue */}
            <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-bengkel-navy">Antrean Booking Hari Ini</h3>
                  <p className="text-xs text-bengkel-muted">Pelanggan yang terjadwal servis hari ini</p>
                </div>
                <Link href="/admin/bookings" className="text-xs font-bold text-bengkel-orange hover:underline">
                  Kelola Semua
                </Link>
              </div>

              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-bengkel-navy">{b.customer?.fullName} ({b.vehicle?.licensePlate})</div>
                      <div className="text-[11px] text-bengkel-muted">{b.timeSlot} — {b.customerComplaint}</div>
                    </div>
                    <Badge status={b.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Invoices Pending Payment */}
            <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-bengkel-navy">Tagihan Kasir Menunggu Bayar</h3>
                  <p className="text-xs text-bengkel-muted">Faktur servis yang belum diselesaikan kasir</p>
                </div>
                <Link href="/admin/invoices" className="text-xs font-bold text-bengkel-orange hover:underline">
                  Buka Kasir
                </Link>
              </div>

              <div className="space-y-3">
                {invoices.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-bold text-bengkel-navy">{inv.invoiceNumber} — {inv.customerName}</div>
                      <div className="text-[11px] text-bengkel-muted">Total: {formatRupiah(inv.totalAmount)}</div>
                    </div>
                    <Badge status={inv.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
