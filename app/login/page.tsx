"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Wrench, Shield, Car } from "lucide-react";
import { DEMO_SESSIONS, setActiveSession } from "@/lib/session";
import { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate
    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi.");
      setLoading(false);
      return;
    }

    // Role-based routing & session binding
    let targetRole: UserRole = "customer";
    let targetRoute = "/customer/dashboard";
    if (email.includes("owner")) {
      targetRole = "workshop_owner";
      targetRoute = "/owner/dashboard";
    } else if (email.includes("admin@sahabat") || email.includes("kasir")) {
      targetRole = "workshop_admin";
      targetRoute = "/admin/dashboard";
    } else if (email.includes("mekanik") || email.includes("mechanic")) {
      targetRole = "mechanic";
      targetRoute = "/mechanic/dashboard";
    } else if (email.includes("superadmin")) {
      targetRole = "super_admin";
      targetRoute = "/super-admin/dashboard";
    }

    setActiveSession(DEMO_SESSIONS[targetRole]);

    setTimeout(() => {
      setLoading(false);
      router.push(targetRoute);
    }, 300);
  };

  const handleQuickLogin = (roleEmail: string, destination: string) => {
    setEmail(roleEmail);
    setPassword("password123");
    setLoading(true);
    let role: UserRole = "customer";
    if (destination.startsWith("/owner")) role = "workshop_owner";
    else if (destination.startsWith("/admin")) role = "workshop_admin";
    else if (destination.startsWith("/mechanic")) role = "mechanic";
    else if (destination.startsWith("/super-admin")) role = "super_admin";
    setActiveSession(DEMO_SESSIONS[role]);
    setTimeout(() => {
      setLoading(false);
      router.push(destination);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-bengkel-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo size="lg" className="justify-center mb-4" />
        <h2 className="text-2xl font-black text-bengkel-navy tracking-tight">Masuk ke BengkelPro</h2>
        <p className="mt-1 text-xs text-bengkel-muted">
          Pusat kendali operasional bengkel terintegrasi Indonesia
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-bengkel-border sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-bengkel-red font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@bengkel.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider">
                  Kata Sandi
                </label>
                <Link href="#" className="text-xs text-bengkel-orange hover:underline font-medium">
                  Lupa sandi?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-bengkel-orange hover:bg-bengkel-orange-hover shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? "Memproses..." : "Masuk Akun"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Switcher */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-[11px] font-bold text-bengkel-muted uppercase tracking-wider text-center mb-3">
              ⚡ Akses Cepat Demo (Pilih Salah Satu)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin("owner@sahabatmotor.id", "/owner/dashboard")}
                className="p-2 rounded-lg border border-gray-200 hover:border-bengkel-orange hover:bg-orange-50/40 text-left transition-colors flex items-center gap-2 font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-bengkel-orange flex-shrink-0" />
                <span className="truncate">Pemilik Bengkel</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@sahabatmotor.id", "/admin/dashboard")}
                className="p-2 rounded-lg border border-gray-200 hover:border-bengkel-orange hover:bg-orange-50/40 text-left transition-colors flex items-center gap-2 font-medium"
              >
                <UserCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="truncate">Admin / Kasir</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("mekanik@sahabatmotor.id", "/mechanic/dashboard")}
                className="p-2 rounded-lg border border-gray-200 hover:border-bengkel-orange hover:bg-orange-50/40 text-left transition-colors flex items-center gap-2 font-medium"
              >
                <Wrench className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="truncate">Mekanik</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("pelanggan@gmail.com", "/customer/dashboard")}
                className="p-2 rounded-lg border border-gray-200 hover:border-bengkel-orange hover:bg-orange-50/40 text-left transition-colors flex items-center gap-2 font-medium"
              >
                <Car className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="truncate">Pelanggan</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("superadmin@bengkelpro.id", "/super-admin/dashboard")}
                className="p-2 rounded-lg border border-gray-200 hover:border-bengkel-orange hover:bg-orange-50/40 text-left transition-colors flex items-center gap-2 font-medium sm:col-span-2 justify-center"
              >
                <Shield className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Super Admin Platform</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-bengkel-muted pt-2">
            Belum memiliki akun bengkel?{" "}
            <Link href="/register-workshop" className="font-bold text-bengkel-orange hover:underline">
              Daftar Bengkel Gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
