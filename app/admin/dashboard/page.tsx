"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Badge } from "@/components/Badge";
import {
  CalendarCheck,
  Wrench,
  Receipt,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [woRes, bkgRes, invRes] = await Promise.all([
        fetch("/api/work-orders", { cache: "no-store" }),
        fetch("/api/bookings", { cache: "no-store" }),
        fetch("/api/invoices", { cache: "no-store" }),
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateInvoice = async (wo: any) => {
    setBusyId(wo.id);
    setNotice(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", workOrderId: wo.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menerbitkan invoice dari SPK.");
      setNotice(`Invoice ${json.invoice?.invoiceNumber} berhasil diterbitkan untuk SPK #${wo.workOrderNumber}.`);
      await fetchData();
      if (json.invoice?.id) {
        router.push(`/admin/invoices?invoiceId=${json.invoice.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal membuat invoice.");
    } finally {
      setBusyId(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const activeRepairs = workOrders.filter((w) =>
    ["waiting", "inspection", "waiting_approval", "in_progress", "waiting_parts"].includes(w.status)
  ).length;
  const readyForCashier = workOrders.filter((w) =>
    w.status === "work_done" || w.status === "awaiting_payment"
  );
  const unpaidInvoices = invoices.filter((i) => i.status === "unpaid" || i.status === "partially_paid");

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
          {notice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notice}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

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
              title="Siap Kasir & Menunggu Bayar"
              value={readyForCashier.length + unpaidInvoices.length}
              description={`${readyForCashier.filter((w) => w.status === "work_done").length} selesai mekanik • ${unpaidInvoices.length} faktur belum lunas`}
              icon={<Receipt className="w-5 h-5" />}
              variant="red"
            />
          </div>

          {/* Mechanic Completed Work Queue Ready for Billing & Payment */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-bengkel-navy">
                  Pekerjaan Selesai Mekanik — Antrean Pemeriksaan & Pembayaran Kasir
                </h3>
                <p className="text-xs text-bengkel-muted">
                  SPK yang telah diselesaikan oleh mekanik dan siap dibuatkan invoice serta diproses pembayarannya
                </p>
              </div>
              <Link href="/admin/invoices" className="text-xs font-bold text-bengkel-orange hover:underline flex items-center gap-1">
                <span>Buka Menu Kasir</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {readyForCashier.length === 0 ? (
              <div className="p-5 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-xs text-center text-bengkel-muted">
                Belum ada SPK baru berstatus Selesai Dikerjakan dari mekanik.
              </div>
            ) : (
              <div className="space-y-2.5">
                {readyForCashier.map((wo) => (
                  <div
                    key={wo.id}
                    data-testid={`cashier-queue-${wo.workOrderNumber}`}
                    className="p-3.5 rounded-xl bg-orange-50/40 border border-orange-200/70 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-bengkel-navy bg-white px-2 py-0.5 rounded border border-gray-200">
                          {wo.workOrderNumber}
                        </span>
                        <span className="font-bold text-bengkel-navy">
                          {wo.customer?.fullName} • {wo.vehicle?.brand} {wo.vehicle?.model} ({wo.vehicle?.licensePlate})
                        </span>
                        <Badge status={wo.status} size="sm" />
                      </div>
                      <div className="text-[11px] text-bengkel-muted">
                        Mekanik: <strong className="text-bengkel-navy">{wo.completedByMechanicName || wo.assignedMechanics?.[0]?.name || "-"}</strong> •{" "}
                        Jasa: {formatRupiah(wo.totalLabor)} • Sparepart: {formatRupiah(wo.totalParts)} •{" "}
                        <strong className="text-bengkel-navy">Total: {formatRupiah(wo.grandTotal)}</strong>
                      </div>
                      {(wo.workResult || wo.inspectionFindings) && (
                        <div className="text-[11px] text-bengkel-text">
                          Hasil Mekanik: {wo.workResult || wo.inspectionFindings}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {wo.status === "work_done" ? (
                        <button
                          type="button"
                          onClick={() => handleGenerateInvoice(wo)}
                          disabled={busyId === wo.id}
                          className="px-3.5 py-2 rounded-lg bg-bengkel-orange hover:bg-bengkel-orange-hover text-white font-bold text-xs shadow-2xs transition-colors disabled:opacity-60"
                        >
                          {busyId === wo.id ? "Membuat Invoice..." : "Buat Invoice & Proses Bayar"}
                        </button>
                      ) : (
                        <Link
                          href={wo.invoiceId ? `/admin/invoices?invoiceId=${wo.invoiceId}` : "/admin/invoices"}
                          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                        >
                          Proses Pembayaran
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                {unpaidInvoices.length === 0 ? (
                  <div className="p-4 text-center text-xs text-bengkel-muted bg-gray-50 rounded-lg border border-gray-100">
                    Semua faktur yang diterbitkan sudah lunas.
                  </div>
                ) : (
                  unpaidInvoices.slice(0, 5).map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/admin/invoices?invoiceId=${inv.id}`}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-mono font-bold text-bengkel-navy">{inv.invoiceNumber} — {inv.customerName}</div>
                        <div className="text-[11px] text-bengkel-muted">Total: {formatRupiah(inv.totalAmount)}</div>
                      </div>
                      <Badge status={inv.status} size="sm" />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
