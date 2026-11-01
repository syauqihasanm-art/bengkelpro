"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ShieldAlert } from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

export default function SuperAdminAuditLogsPage() {
  const logs = [
    { time: "2026-10-31T14:00:00Z", user: "owner@sahabatmotor.id", action: "WORK_ORDER_CREATED", ip: "182.1.20.45", detail: "Membuat SPK #WO-2611-0001" },
    { time: "2026-10-28T11:35:00Z", user: "admin@sahabatmotor.id", action: "PAYMENT_RECORDED", ip: "182.1.20.45", detail: "Pembayaran faktur #INV-2610-0045 Rp 130.000 via QRIS" },
    { time: "2026-10-25T16:00:00Z", user: "owner@sahabatmotor.id", action: "EXPENSE_RECORDED", ip: "182.1.20.45", detail: "Mencatat pengeluaran operasional Rp 125.000" },
    { time: "2026-10-15T12:00:00Z", user: "superadmin@bengkelpro.id", action: "WORKSHOP_APPROVED", ip: "127.0.0.1", detail: "Menyetujui pendaftaran Bengkel Sahabat Motor" },
  ];

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="super_admin" userName="Super Admin" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Audit Log Keamanan & Aktivitas"
          subtitle="Jejak audit permanen aktivitas sistem dan mitigasi insiden keamanan"
          currentRole="super_admin"
        />

        <main className="flex-1 p-6 space-y-6 max-w-6xl w-full mx-auto">
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Waktu Kejadian</th>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4 font-mono">Action Code</th>
                    <th className="py-3 px-4">Rincian Perubahan</th>
                    <th className="py-3 px-4 text-right">Alamat IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((l, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-bengkel-muted">{formatIndonesianDate(l.time, true)}</td>
                      <td className="py-3.5 px-4 font-bold text-bengkel-navy">{l.user}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-bengkel-orange">{l.action}</td>
                      <td className="py-3.5 px-4 text-bengkel-text">{l.detail}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-400">{l.ip}</td>
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
