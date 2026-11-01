"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Crown, CheckCircle2, Shield, ArrowRight, Zap } from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export default function SubscriptionPage() {
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchSub = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions");
      const data = await res.json();
      setSub(data.subscription);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSub();
  }, []);

  const handleUpgrade = async (planCode: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah paket");
      alert(data.message);
      fetchSub();
    } catch (err: any) {
      alert(err.message || "Gagal mengubah paket");
    } finally {
      setUpdating(false);
    }
  };

  const plans = [
    { code: "free", name: "Free", price: 0, staff: "1 Staf", quota: "30 SPK/bln", ai: false },
    { code: "basic", name: "Basic", price: 49000, staff: "3 Staf", quota: "Tanpa Batas", ai: false },
    { code: "pro", name: "Pro", price: 99000, staff: "10 Staf", quota: "Tanpa Batas", ai: true },
    { code: "business", name: "Business", price: 199000, staff: "25 Staf", quota: "Tanpa Batas", ai: true },
  ];

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="workshop_owner" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Paket Langganan SaaS Bengkel"
          subtitle="Atur kuota SPK, jumlah akun staf teknisi, dan fitur AI cerdas"
          currentRole="workshop_owner"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Active Plan Card */}
          <div className="bg-gradient-to-r from-bengkel-navy to-bengkel-navy-light text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bengkel-orange text-white text-[11px] font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" />
                <span>Paket Langganan Aktif</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight uppercase">
                Paket {sub?.planCode || "FREE"}
              </h2>
              <p className="text-xs text-gray-300">
                Masa berlaku: Aktif hingga {formatIndonesianDate(sub?.endDate || new Date())}
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-xs space-y-1 text-xs">
              <div>Batas Staf: <span className="font-bold">{sub?.maxStaff || 1} Akun</span></div>
              <div>Kuota SPK: <span className="font-bold">{sub?.maxWorkOrdersPerMonth > 500 ? "Tanpa Batas" : `${sub?.maxWorkOrdersPerMonth} SPK/bln`}</span></div>
              <div>Asisten AI: <span className="font-bold">{sub?.hasAi ? "Aktif (Google Gemini)" : "Tidak Aktif"}</span></div>
            </div>
          </div>

          {/* Plan Upgrade Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => {
              const isCurrent = sub?.planCode === p.code;
              return (
                <div
                  key={p.code}
                  className={`bg-white rounded-2xl p-6 border shadow-xs flex flex-col justify-between ${
                    isCurrent ? "border-2 border-bengkel-orange" : "border-bengkel-border"
                  }`}
                >
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-bengkel-navy">{p.name}</h3>
                    <div className="text-2xl font-black text-bengkel-navy">
                      {p.price === 0 ? "Gratis" : formatRupiah(p.price)}
                    </div>
                    <div className="text-[11px] text-bengkel-muted">per bulan</div>

                    <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-bengkel-text">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-bengkel-green" />
                        <span>{p.staff}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-bengkel-green" />
                        <span>{p.quota}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-bengkel-green" />
                        <span>{p.ai ? "Didukung AI Gemini" : "Tanpa AI"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-500 cursor-default"
                      >
                        Paket Aktif
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(p.code)}
                        disabled={updating}
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-bengkel-orange hover:bg-bengkel-orange-hover text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Pilih Paket {p.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
