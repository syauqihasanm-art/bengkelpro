"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Crown } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function SuperAdminSubscriptionsPage() {
  const subscriptions = [
    { workshop: "Bengkel Sahabat Motor", plan: "PRO", price: 99000, status: "Aktif", period: "1 Okt 2026 - 1 Okt 2027" },
    { workshop: "AutoPrima Service Mobil", plan: "BASIC", price: 49000, status: "Aktif", period: "15 Okt 2026 - 15 Nov 2026" },
  ];

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="super_admin" userName="Super Admin" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Audit Langganan Platform"
          subtitle="Pemantauan paket komersial aktif seluruh bengkel tenant"
          currentRole="super_admin"
        />

        <main className="flex-1 p-6 space-y-6 max-w-6xl w-full mx-auto">
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Nama Bengkel</th>
                    <th className="py-3 px-4">Paket SaaS</th>
                    <th className="py-3 px-4 text-right">Tarif Bulanan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Masa Aktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscriptions.map((s, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-bengkel-navy">{s.workshop}</td>
                      <td className="py-3.5 px-4 font-bold text-bengkel-orange">{s.plan}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-bengkel-navy">{formatRupiah(s.price)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-bengkel-muted">{s.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
