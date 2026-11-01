"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Users, Shield, UserCheck, Wrench, Car } from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

export default function SuperAdminUsersPage() {
  const users = [
    { email: "superadmin@bengkelpro.id", name: "Super Admin Platform", role: "Super Admin", created: "2026-10-01" },
    { email: "owner@sahabatmotor.id", name: "Budi Santoso", role: "Workshop Owner", created: "2026-10-01" },
    { email: "admin@sahabatmotor.id", name: "Dewi Lestari", role: "Workshop Admin", created: "2026-10-01" },
    { email: "mekanik@sahabatmotor.id", name: "Agus Prasetyo", role: "Mechanic", created: "2026-10-01" },
    { email: "pelanggan@gmail.com", name: "Rudi Hermawan", role: "Customer", created: "2026-10-01" },
  ];

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="super_admin" userName="Super Admin" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Pengguna Seluruh Platform"
          subtitle="Audit daftar akun pemilik, admin kasir, mekanik, dan pelanggan"
          currentRole="super_admin"
        />

        <main className="flex-1 p-6 space-y-6 max-w-6xl w-full mx-auto">
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Nama Pengguna</th>
                    <th className="py-3 px-4">Alamat Email</th>
                    <th className="py-3 px-4">Role Akses</th>
                    <th className="py-3 px-4 text-right">Terdaftar Sejak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-bengkel-navy">{u.name}</td>
                      <td className="py-3.5 px-4 font-mono text-bengkel-muted">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] border border-blue-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-bengkel-muted">
                        {formatIndonesianDate(u.created)}
                      </td>
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
