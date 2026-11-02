"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Shield, ChevronDown, Check, Menu } from "lucide-react";
import { UserRole } from "@/types";

interface HeaderProps {
  title: string;
  subtitle?: string;
  currentRole: UserRole;
  userName?: string;
  onToggleSidebar?: () => void;
}

export function Header({ title, subtitle, currentRole, userName, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toggle-mobile-sidebar"));
    }
  };

  const roles: { role: UserRole; label: string; path: string }[] = [
    { role: "workshop_owner", label: "Owner (Budi Santoso)", path: "/owner/dashboard" },
    { role: "workshop_admin", label: "Admin/Kasir (Dewi Lestari)", path: "/admin/dashboard" },
    { role: "mechanic", label: "Mekanik (Agus Prasetyo)", path: "/mechanic/dashboard" },
    { role: "customer", label: "Pelanggan (Rudi Hermawan)", path: "/customer/dashboard" },
    { role: "super_admin", label: "Super Admin Platform", path: "/super-admin/dashboard" },
  ];

  return (
    <header className="h-16 bg-white border-b border-bengkel-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={handleToggleSidebar}
          className="md:hidden p-2 -ml-2 rounded-lg text-bengkel-navy hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-bengkel-orange flex-shrink-0"
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5 text-bengkel-navy" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-bengkel-navy tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-bengkel-muted truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher for Seamless Testing & QA */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-bengkel-border bg-bengkel-bg hover:bg-gray-100 text-xs font-semibold text-bengkel-navy transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-bengkel-orange" />
            <span className="hidden sm:inline">Role Simulasi:</span>
            <span className="text-bengkel-orange">{roles.find((r) => r.role === currentRole)?.label.split(" ")[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-bengkel-border py-1.5 z-50 animate-in fade-in-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-bengkel-muted uppercase tracking-wider border-b border-gray-100">
                Ganti Role Pengguna
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push(r.path);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-orange-50 transition-colors ${
                    currentRole === r.role ? "font-bold text-bengkel-orange bg-orange-50/50" : "text-bengkel-text"
                  }`}
                >
                  <span>{r.label}</span>
                  {currentRole === r.role && <Check className="w-3.5 h-3.5 text-bengkel-orange" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 text-gray-500 hover:text-bengkel-navy hover:bg-gray-100 rounded-lg transition-colors relative"
            title="Notifikasi"
            onClick={() => alert("Notifikasi: Tidak ada peringatan sistem kritis saat ini. Semua layanan operasional normal.")}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-bengkel-orange rounded-full ring-2 ring-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
