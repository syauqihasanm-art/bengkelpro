"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types";
import { Logo } from "./Logo";
import {
  LayoutDashboard,
  Users,
  Car,
  CalendarCheck,
  Wrench,
  UserCheck,
  Package,
  Truck,
  ShoppingCart,
  Receipt,
  TrendingDown,
  BarChart3,
  Sparkles,
  Crown,
  Settings,
  ClipboardList,
  History,
  User,
  ShieldAlert,
  Building2,
  FileCheck,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  role: UserRole;
  workshopName?: string;
  userName?: string;
}

export function Sidebar({ role, workshopName = "Bengkel Sahabat Motor", userName = "Pengguna" }: SidebarProps) {
  const pathname = usePathname();

  const getNavItems = () => {
    switch (role) {
      case "workshop_owner":
        return [
          { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
          { label: "Pelanggan", href: "/owner/customers", icon: Users },
          { label: "Kendaraan", href: "/owner/vehicles", icon: Car },
          { label: "Booking & Antrean", href: "/owner/bookings", icon: CalendarCheck },
          { label: "SPK / Work Order", href: "/owner/work-orders", icon: Wrench },
          { label: "Tim Mekanik", href: "/owner/mechanics", icon: UserCheck },
          { label: "Stok Spare Part", href: "/owner/inventory", icon: Package },
          { label: "Supplier", href: "/owner/suppliers", icon: Truck },
          { label: "Pembelian (PO)", href: "/owner/purchases", icon: ShoppingCart },
          { label: "Faktur & Invoice", href: "/owner/invoices", icon: Receipt },
          { label: "Pengeluaran Kas", href: "/owner/expenses", icon: TrendingDown },
          { label: "Laporan Keuangan", href: "/owner/reports", icon: BarChart3 },
          { label: "Asisten AI", href: "/owner/ai-assistant", icon: Sparkles, badge: "AI" },
          { label: "Langganan SaaS", href: "/owner/subscription", icon: Crown },
          { label: "Pengaturan Bengkel", href: "/owner/settings", icon: Settings },
        ];

      case "workshop_admin":
        return [
          { label: "Dashboard Kasir", href: "/admin/dashboard", icon: LayoutDashboard },
          { label: "Data Pelanggan", href: "/admin/customers", icon: Users },
          { label: "Data Kendaraan", href: "/admin/vehicles", icon: Car },
          { label: "Antrean & Booking", href: "/admin/bookings", icon: CalendarCheck },
          { label: "Kelola SPK", href: "/admin/work-orders", icon: Wrench },
          { label: "Cek Stok Part", href: "/admin/inventory", icon: Package },
          { label: "Kasir & Invoice", href: "/admin/invoices", icon: Receipt },
          { label: "Pengaturan Profil", href: "/admin/settings", icon: Settings },
        ];

      case "mechanic":
        return [
          { label: "Dashboard Tugas", href: "/mechanic/dashboard", icon: LayoutDashboard },
          { label: "Daftar Pekerjaan", href: "/mechanic/jobs", icon: ClipboardList },
          { label: "Riwayat Servis", href: "/mechanic/history", icon: History },
          { label: "Profil Saya", href: "/mechanic/profile", icon: User },
        ];

      case "customer":
        return [
          { label: "Beranda Pelanggan", href: "/customer/dashboard", icon: LayoutDashboard },
          { label: "Kendaraan Saya", href: "/customer/vehicles", icon: Car },
          { label: "Booking Servis", href: "/customer/bookings", icon: CalendarCheck },
          { label: "Riwayat Servis", href: "/customer/service-history", icon: History },
          { label: "Tagihan Faktur", href: "/customer/invoices", icon: Receipt },
          { label: "Profil Akun", href: "/customer/profile", icon: User },
        ];

      case "super_admin":
        return [
          { label: "Platform Overview", href: "/super-admin/dashboard", icon: LayoutDashboard },
          { label: "Kelola Bengkel", href: "/super-admin/workshops", icon: Building2 },
          { label: "Persetujuan Daftar", href: "/super-admin/registrations", icon: FileCheck },
          { label: "Semua Pengguna", href: "/super-admin/users", icon: Users },
          { label: "Paket Langganan", href: "/super-admin/subscriptions", icon: Crown },
          { label: "Audit Log Sistem", href: "/super-admin/audit-logs", icon: ShieldAlert },
          { label: "Pengaturan Global", href: "/super-admin/settings", icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  const roleLabels: Record<UserRole, string> = {
    super_admin: "Super Admin Platform",
    workshop_owner: "Owner Bengkel",
    workshop_admin: "Admin / Kasir",
    mechanic: "Mekanik Bengkel",
    customer: "Pelanggan",
  };

  return (
    <aside className="w-64 bg-bengkel-navy text-white flex flex-col flex-shrink-0 h-screen sticky top-0 border-r border-bengkel-navy-light select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-bengkel-navy-light flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-bengkel-orange flex items-center justify-center font-black text-white text-base">
            BP
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight leading-none text-white">Bengkel<span className="text-bengkel-orange">Pro</span></span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">{roleLabels[role]}</span>
          </div>
        </Link>
      </div>

      {/* Workshop Context Info */}
      <div className="px-5 py-3.5 bg-bengkel-navy-dark/60 border-b border-bengkel-navy-light">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tenant / Bengkel</div>
        <div className="text-sm font-bold text-white truncate mt-0.5">{workshopName}</div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/owner/dashboard" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-bengkel-orange text-white font-semibold shadow-xs"
                  : "text-gray-300 hover:bg-bengkel-navy-light hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-white/20 text-white uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-bengkel-navy-light bg-bengkel-navy-dark/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-bengkel-navy-light flex items-center justify-center text-xs font-bold text-bengkel-orange flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[10px] text-gray-400 truncate">{roleLabels[role]}</p>
          </div>
        </div>
        <Link
          href="/login"
          title="Keluar"
          className="p-1.5 text-gray-400 hover:text-bengkel-red rounded-md hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
