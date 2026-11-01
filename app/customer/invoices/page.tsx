"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { Receipt, Printer } from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => setInvoices(data.invoices || []))
      .catch(console.error);
  }, []);

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="customer" userName="Rudi Hermawan" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Faktur & Tagihan Servis"
          subtitle="Daftar nota resmi dan bukti pembayaran bengkel"
          currentRole="customer"
        />

        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Nomor Faktur</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-center">Status Pembayaran</th>
                    <th className="py-3 px-4 text-right">Total Tagihan</th>
                    <th className="py-3 px-4 text-right">Telah Dibayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-bengkel-navy">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-bengkel-muted">
                        {formatIndonesianDate(inv.invoiceDate)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge status={inv.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-bengkel-navy">
                        {formatRupiah(inv.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-bengkel-green">
                        {formatRupiah(inv.paidAmount)}
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
