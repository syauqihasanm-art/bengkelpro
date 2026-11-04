"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  Compass,
  LayoutDashboard,
  BarChart4,
  Package,
  Wrench,
  Users,
  Car,
  CalendarCheck,
  Receipt,
  UserCheck,
  Building2,
  Bot,
  Settings,
  CreditCard,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  TrendingDown,
  Truck,
} from "lucide-react";

export function QuickFeatureLauncher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"owner" | "admin" | "mechanic" | "customer" | "superadmin">("owner");

  // Dismiss on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const roles = [
    { id: "owner" as const, label: "Pemilik (Owner)", icon: "👑", badge: "Akses Penuh" },
    { id: "admin" as const, label: "Admin / Kasir", icon: "💼", badge: "Operasional" },
    { id: "mechanic" as const, label: "Mekanik", icon: "🔧", badge: "Pengerjaan" },
    { id: "customer" as const, label: "Pelanggan", icon: "🚗", badge: "Tracking" },
    { id: "superadmin" as const, label: "Super Admin", icon: "🛡️", badge: "Platform" },
  ];

  const featuresByRole = {
    owner: [
      { name: "Dashboard Utama", href: "/owner/dashboard", icon: LayoutDashboard, desc: "Ringkasan omzet, laba kotor & statistik bengkel" },
      { name: "Laporan Laba Rugi", href: "/owner/reports", icon: BarChart4, desc: "Pendapatan riil, HPP parts, biaya operasional & laba bersih" },
      { name: "Inventaris Stok Suku Cadang", href: "/owner/inventory", icon: Package, desc: "Katalog onderdil, stok minimum & riwayat mutasi FIFO" },
      { name: "Surat Perintah Kerja (SPK)", href: "/owner/work-orders", icon: Wrench, desc: "Kelola siklus servis dari antrean hingga invoice" },
      { name: "Kasir & Faktur (Invoice)", href: "/owner/invoices", icon: Receipt, desc: "Hitung otomatis jasa, part, PPN 11% & diskon" },
      { name: "Antrean & Booking Masuk", href: "/owner/bookings", icon: CalendarCheck, desc: "Daftar reservasi online pelanggan dengan kuota harian" },
      { name: "Data Pelanggan Bengkel", href: "/owner/customers", icon: Users, desc: "Buku kontak pelanggan, riwayat kunjungan & catatan" },
      { name: "Data Kendaraan Terdaftar", href: "/owner/vehicles", icon: Car, desc: "Registrasi plat nomor, tipe motor/mobil & odometer" },
      { name: "Tim Mekanik Bengkel", href: "/owner/mechanics", icon: UserCheck, desc: "Kelola personel teknisi dan pembagian beban kerja" },
      { name: "Supplier & Pemasok Part", href: "/owner/suppliers", icon: Truck, desc: "Kelola rekanan distributor suku cadang & vendor bengkel" },
      { name: "Pemasok & Pembelian (PO)", href: "/owner/purchases", icon: Building2, desc: "Purchase order dan penerimaan stok onderdil baru" },
      { name: "Pengeluaran Kas Operasional", href: "/owner/expenses", icon: TrendingDown, desc: "Pencatatan beban operasional, gaji, utilitas & pengeluaran kas" },
      { name: "Asisten AI Otomotif Pintar", href: "/owner/ai-assistant", icon: Bot, desc: "Diagnosa kerusakan & estimasi servis bertenaga AI" },
      { name: "Pengaturan & Profil Bengkel", href: "/owner/settings", icon: Settings, desc: "Atur jam buka, kuota harian, alamat & logo bengkel" },
      { name: "Paket Langganan Bengkel", href: "/owner/subscription", icon: CreditCard, desc: "Manajemen paket Free, Basic, Pro & Business" },
    ],
    admin: [
      { name: "Dashboard Kasir", href: "/admin/dashboard", icon: LayoutDashboard, desc: "Ringkasan transaksi kasir, antrean servis & aktivitas harian" },
      { name: "Kasir & Faktur Pelanggan", href: "/admin/invoices", icon: Receipt, desc: "Penerimaan pembayaran tunai, transfer & QRIS instan" },
      { name: "Antrean Booking Harian", href: "/admin/bookings", icon: CalendarCheck, desc: "Check-in kendaraan pelanggan yang datang servis" },
      { name: "Surat Perintah Kerja (SPK)", href: "/admin/work-orders", icon: Wrench, desc: "Buat SPK baru dan pantau pengerjaan oleh teknisi" },
      { name: "Cek Stok Suku Cadang", href: "/admin/inventory", icon: Package, desc: "Periksa ketersediaan oli, ban & sparepart gudang" },
      { name: "Pendaftaran Pelanggan", href: "/admin/customers", icon: Users, desc: "Tambah data pelanggan baru yang datang langsung" },
      { name: "Registrasi Kendaraan", href: "/admin/vehicles", icon: Car, desc: "Catat plat nomor dan data motor/mobil servis" },
      { name: "Pengaturan Profil Admin", href: "/admin/settings", icon: Settings, desc: "Kelola profil akun kasir dan preferensi kerja" },
    ],
    mechanic: [
      { name: "Daftar SPK Pengerjaan Saya", href: "/mechanic/jobs", icon: Wrench, desc: "Lihat kendaraan yang ditugaskan ke Anda hari ini" },
      { name: "Riwayat Servis Diselesaikan", href: "/mechanic/history", icon: CalendarCheck, desc: "Catatan histori pekerjaan teknisi yang telah selesai" },
      { name: "Dashboard Kinerja Mekanik", href: "/mechanic/dashboard", icon: LayoutDashboard, desc: "Metrik jumlah kendaraan dan target pengerjaan" },
      { name: "Profil & Keahlian Mekanik", href: "/mechanic/profile", icon: UserCheck, desc: "Data diri dan spesialisasi servis mekanik" },
    ],
    customer: [
      { name: "Booking Servis Online Mandiri", href: "/booking/sahabat-motor", icon: CalendarCheck, desc: "Formulir publik reservasi servis tanpa antre fisik" },
      { name: "Status Pengerjaan Servis Saya", href: "/customer/dashboard", icon: LayoutDashboard, desc: "Pantau progres perbaikan kendaraan secara live" },
      { name: "Buku Servis Digital & Histori", href: "/customer/service-history", icon: Wrench, desc: "Catatan riwayat ganti oli, part, dan servis berkala" },
      { name: "Garasi Kendaraan Terdaftar", href: "/customer/vehicles", icon: Car, desc: "Kelola data motor atau mobil yang Anda miliki" },
      { name: "Faktur & Riwayat Pembayaran", href: "/customer/invoices", icon: Receipt, desc: "Unduh kwitansi digital dan bukti pembayaran resmi" },
      { name: "Profil & Preferensi Pelanggan", href: "/customer/profile", icon: UserCheck, desc: "Kelola data kontak dan preferensi notifikasi Anda" },
    ],
    superadmin: [
      { name: "Dashboard Ekosistem Platform", href: "/super-admin/dashboard", icon: LayoutDashboard, desc: "Statistik global seluruh bengkel terdaftar di Indonesia" },
      { name: "Direktori Seluruh Tenant Bengkel", href: "/super-admin/workshops", icon: Building2, desc: "Database seluruh mitra bengkel aktif dan terdaftar" },
      { name: "Persetujuan Bengkel Baru", href: "/super-admin/registrations", icon: Building2, desc: "Verifikasi dan aktivasi bengkel yang baru mendaftar" },
      { name: "Langganan & Billing Global", href: "/super-admin/subscriptions", icon: CreditCard, desc: "Monitoring paket subscription dan recurring revenue bengkel" },
      { name: "Kelola Pengguna & Hak Akses", href: "/super-admin/users", icon: Users, desc: "Daftar seluruh akun pemilik, admin, teknisi & user" },
      { name: "Audit Log & Jejak Keamanan", href: "/super-admin/audit-logs", icon: ShieldAlert, desc: "Monitoring aktivitas login dan integritas data sistem" },
      { name: "Pengaturan & Konfigurasi Platform", href: "/super-admin/settings", icon: Settings, desc: "Konfigurasi tarif platform, batas kuota, dan kebijakan sistem" },
    ],
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <aside aria-label="Akses Cepat Navigator" className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-bengkel-navy via-slate-900 to-bengkel-navy text-white shadow-2xl shadow-navy-950/40 border border-amber-400/40 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all duration-300"
          title="Buka Pusat Navigasi Seluruh Fitur BengkelPro"
        >
          <div className="relative">
            <Compass className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
          </div>
          <span className="text-xs font-bold tracking-wide uppercase text-amber-300 group-hover:text-amber-200">
            ⚡ Pusat Fitur (1-Klik)
          </span>
        </button>
      </aside>

      {/* Modal / Drawer Launcher */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-bengkel-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-bengkel-navy to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                    <span>Pusat Navigasi Semua Fitur BengkelPro</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-bengkel-navy uppercase tracking-wider">
                      1-Klik Langsung
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Pilih peran dan klik fitur apa saja untuk langsung membuka halaman tanpa perlu login manual.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Tabs */}
            <div className="flex items-center gap-1.5 p-3 sm:px-6 bg-slate-50 border-b border-bengkel-border overflow-x-auto scrollbar-none">
              {roles.map((r) => {
                const isActive = activeTab === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActiveTab(r.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "bg-bengkel-orange text-white shadow-md shadow-orange-500/20 scale-[1.02]"
                        : "bg-white text-bengkel-text border border-bengkel-border hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-sm">{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Feature Cards Grid (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto max-h-[60vh] space-y-3">
              <div className="flex items-center justify-between pb-2">
                <div className="text-xs font-bold uppercase tracking-wider text-bengkel-muted">
                  Daftar Fitur: <span className="text-bengkel-navy">{roles.find((r) => r.id === activeTab)?.label}</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {featuresByRole[activeTab].length} Fitur Siap Diklik
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featuresByRole[activeTab].map((f) => {
                  const Icon = f.icon;
                  return (
                    <Link
                      key={f.href}
                      href={f.href}
                      onClick={() => setIsOpen(false)}
                      className="group p-3.5 rounded-2xl border border-bengkel-border hover:border-bengkel-orange bg-white hover:bg-orange-50/30 transition-all duration-200 flex items-start gap-3.5 shadow-xs hover:shadow-md"
                    >
                      <div className="p-2.5 rounded-xl bg-slate-100 text-bengkel-navy group-hover:bg-bengkel-orange group-hover:text-white transition-colors duration-200 flex-shrink-0 mt-0.5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-bengkel-navy group-hover:text-bengkel-orange truncate transition-colors">
                            {f.name}
                          </h4>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-bengkel-orange group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>
                        <p className="text-xs text-bengkel-muted mt-0.5 line-clamp-2">
                          {f.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Footer with Quick Portals */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-bengkel-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-bengkel-muted">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Semua halaman terhubung ke data bengkel &amp; siap diakses dari HP / tablet.</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/booking/sahabat-motor"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-bengkel-border bg-white font-semibold text-bengkel-navy hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <span>Form Booking Pelanggan</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-bengkel-navy text-white font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <span>Halaman Login Role</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
