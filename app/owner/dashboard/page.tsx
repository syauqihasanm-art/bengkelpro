"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Badge } from "@/components/Badge";
import {
  DollarSign,
  TrendingUp,
  Users,
  Car,
  CalendarCheck,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export default function OwnerDashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repRes, woRes, bkgRes] = await Promise.all([
        fetch("/api/reports"),
        fetch("/api/work-orders"),
        fetch("/api/bookings"),
      ]);

      const repData = await repRes.json();
      const woData = await woRes.json();
      const bkgData = await bkgRes.json();

      setSummary(repData.summary);
      setWorkOrders(woData.workOrders || []);
      setBookings(bkgData.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="workshop_owner" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Dashboard Pemilik Bengkel"
          subtitle="Ringkasan performa finansial dan operasional bengkel Anda hari ini"
          currentRole="workshop_owner"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-bengkel-navy uppercase tracking-wider">Aksi Cepat:</span>
              <Link
                href="/owner/work-orders"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat SPK Baru</span>
              </Link>
              <Link
                href="/owner/customers"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bengkel-bg border border-bengkel-border text-bengkel-navy text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-bengkel-orange" />
                <span>Tambah Pelanggan</span>
              </Link>
              <Link
                href="/owner/inventory"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bengkel-bg border border-bengkel-border text-bengkel-navy text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Cek Stok Part</span>
              </Link>
            </div>

            <button
              onClick={fetchData}
              className="p-1.5 text-bengkel-muted hover:text-bengkel-navy hover:bg-gray-100 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* KPI Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Pendapatan Kas (Lunas)"
              value={formatRupiah(summary?.totalRevenue || 0)}
              description="Dari transaksi kasir yang terkonfirmasi"
              icon={<DollarSign className="w-5 h-5" />}
              variant="green"
            />
            <StatsCard
              title="Estimasi Laba Bersih"
              value={formatRupiah(summary?.netProfit || 0)}
              description="Setelah dikurangi HPP part & biaya operasional"
              icon={<TrendingUp className="w-5 h-5" />}
              variant="orange"
            />
            <StatsCard
              title="SPK Aktif Dikerjakan"
              value={summary?.activeWorkOrders || 0}
              description="Kendaraan saat ini di pit servis"
              icon={<Wrench className="w-5 h-5" />}
              variant="navy"
            />
            <StatsCard
              title="Peringatan Stok Tipis"
              value={summary?.lowStockCount || 0}
              description="Suku cadang mendekati batas minimum"
              icon={<AlertTriangle className="w-5 h-5" />}
              variant="red"
            />
          </div>

          {/* Secondary Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs text-center">
            <div>
              <div className="text-xs text-bengkel-muted font-medium">Omzet Jasa Servis</div>
              <div className="text-base font-bold text-bengkel-navy mt-0.5">
                {formatRupiah(summary?.serviceRevenue || 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-bengkel-muted font-medium">Omzet Penjualan Part</div>
              <div className="text-base font-bold text-bengkel-navy mt-0.5">
                {formatRupiah(summary?.partsRevenue || 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-bengkel-muted font-medium">HPP Suku Cadang Terpakai</div>
              <div className="text-base font-bold text-bengkel-red mt-0.5">
                {formatRupiah(summary?.cogs || 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-bengkel-muted font-medium">Beban Operasional Kas</div>
              <div className="text-base font-bold text-bengkel-red mt-0.5">
                {formatRupiah(summary?.totalExpenses || 0)}
              </div>
            </div>
          </div>

          {/* Two-Column Operational Activity View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Work Orders */}
            <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-bengkel-navy">SPK & Pengerjaan Terkini</h3>
                  <p className="text-xs text-bengkel-muted">Daftar perbaikan kendaraan yang sedang berlangsung</p>
                </div>
                <Link
                  href="/owner/work-orders"
                  className="text-xs font-bold text-bengkel-orange hover:underline flex items-center gap-1"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {workOrders.length === 0 ? (
                <div className="text-center py-8 text-xs text-bengkel-muted">
                  Belum ada SPK aktif saat ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {workOrders.slice(0, 5).map((wo) => (
                    <div
                      key={wo.id}
                      className="p-3.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50/50 flex items-center justify-between transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-bengkel-navy">{wo.workOrderNumber}</span>
                          <Badge status={wo.status} size="sm" />
                        </div>
                        <div className="text-xs text-bengkel-text font-medium">
                          {wo.customer?.fullName || "Pelanggan"} —{" "}
                          <span className="font-bold text-bengkel-navy">
                            {wo.vehicle?.brand} {wo.vehicle?.model} ({wo.vehicle?.licensePlate})
                          </span>
                        </div>
                        <div className="text-[11px] text-bengkel-muted truncate max-w-xs">
                          {wo.customerComplaint}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-bengkel-navy">{formatRupiah(wo.grandTotal)}</div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {formatIndonesianDate(wo.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Bookings & Queue */}
            <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-bengkel-navy">Jadwal Booking & Antrean</h3>
                  <p className="text-xs text-bengkel-muted">Reservasi servis dari website dan loket bengkel</p>
                </div>
                <Link
                  href="/owner/bookings"
                  className="text-xs font-bold text-bengkel-orange hover:underline flex items-center gap-1"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-8 text-xs text-bengkel-muted">
                  Belum ada antrean booking hari ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((bkg) => (
                    <div
                      key={bkg.id}
                      className="p-3.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50/50 flex items-center justify-between transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-bengkel-orange">{bkg.bookingCode}</span>
                          <Badge status={bkg.status} size="sm" />
                        </div>
                        <div className="text-xs text-bengkel-text font-medium">
                          {bkg.customer?.fullName} — {bkg.vehicle?.brand} {bkg.vehicle?.model} ({bkg.vehicle?.licensePlate})
                        </div>
                        <div className="text-[11px] text-bengkel-muted">
                          Jam: {bkg.timeSlot} WIB ({formatIndonesianDate(bkg.serviceDate)})
                        </div>
                      </div>
                      <Link
                        href="/owner/bookings"
                        className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-200 hover:bg-white text-bengkel-navy transition-colors"
                      >
                        Kelola
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
