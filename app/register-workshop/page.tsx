"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Building2, User, Mail, Phone, MapPin, Lock, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterWorkshopPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    workshopType: "motor" as "motor" | "mobil" | "umum",
    address: "",
    city: "",
    province: "DKI Jakarta",
    description: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mendaftarkan bengkel.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/owner/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bengkel-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-3" />
          <h1 className="text-3xl font-black text-bengkel-navy tracking-tight">Daftarkan Bengkel Anda</h1>
          <p className="text-sm text-bengkel-muted mt-1">
            Bergabunglah dengan ratusan bengkel profesional di seluruh Indonesia.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-md border border-bengkel-border space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-bengkel-red font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-bengkel-green font-medium flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Pendaftaran berhasil! Mengarahkan Anda ke Dashboard Pemilik...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                  Nama Bengkel *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Bengkel Maju Motor"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                  Nama Pemilik / Owner *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Nama Lengkap Pemilik"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                  Email Akun *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="owner@bengkel.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                  Nomor WhatsApp / HP *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                  Kategori Bengkel *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: "motor", label: "Bengkel Motor" },
                    { val: "mobil", label: "Bengkel Mobil" },
                    { val: "umum", label: "Bengkel Umum" },
                  ].map((cat) => (
                    <button
                      key={cat.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, workshopType: cat.val as any })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        formData.workshopType === cat.val
                          ? "bg-bengkel-orange text-white border-bengkel-orange shadow-xs"
                          : "bg-white text-bengkel-text border-bengkel-border hover:bg-gray-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                  Alamat Lengkap Bengkel *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Jl. Raya Utama No. 12"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                  Kota / Kabupaten *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Jakarta Selatan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                  Provinsi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="DKI Jakarta"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                  Kata Sandi Akun Pemilik *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:ring-2 focus:ring-bengkel-orange/30 focus:border-bengkel-orange"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-base font-bold text-white bg-bengkel-orange hover:bg-bengkel-orange-hover shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>{loading ? "Mendaftarkan Bengkel..." : "Daftarkan Bengkel Sekarang (Gratis)"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="text-center text-xs text-bengkel-muted pt-2 border-t border-gray-100">
            Sudah memiliki akun bengkel terdaftar?{" "}
            <Link href="/login" className="font-bold text-bengkel-orange hover:underline">
              Masuk ke Akun Anda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
