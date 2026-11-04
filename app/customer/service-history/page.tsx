"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { History, Wrench, Package, Calendar, Gauge, CheckCircle2, AlertCircle } from "lucide-react";
import { formatIndonesianDate, formatRupiah } from "@/lib/utils";

export default function CustomerServiceHistoryPage() {
  const [histories, setHistories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/service-history")
      .then((res) => res.json())
      .then((data) => {
        if (data.histories) {
          setHistories(data.histories);
        }
      })
      .catch((err) => console.error("Error fetching service history:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="customer" userName="Rudi Hermawan" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Buku Servis Digital"
          subtitle="Catatan permanen riwayat perbaikan dan penggantian suku cadang kendaraan Anda"
          currentRole="customer"
        />

        <main className="flex-1 p-6 space-y-6 max-w-4xl w-full mx-auto">
          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-bengkel-border text-center text-xs text-bengkel-muted">
              Memuat riwayat servis kendaraan...
            </div>
          ) : histories.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-bengkel-border text-center space-y-2">
              <History className="w-8 h-8 text-bengkel-muted mx-auto" />
              <p className="text-sm font-bold text-bengkel-navy">Belum Ada Riwayat Servis</p>
              <p className="text-xs text-bengkel-muted">Catatan servis akan otomatis tersimpan setelah kendaraan selesai diperbaiki di bengkel.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {histories.map((h) => (
                <div
                  key={h.id}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-bengkel-border shadow-xs space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-base font-black text-bengkel-navy">{h.vehicleName}</h3>
                      <div className="text-xs text-bengkel-muted mt-0.5">
                        Tanggal Servis: {formatIndonesianDate(h.serviceDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-bengkel-muted font-medium">Total Biaya:</span>
                      <div className="text-lg font-black text-bengkel-navy">{formatRupiah(h.totalCost)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="font-bold text-bengkel-navy mb-1 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-bengkel-orange" />
                        <span>Pekerjaan Servis Dilakukan:</span>
                      </div>
                      <p className="text-bengkel-text">{h.workCompleted}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="font-bold text-bengkel-navy mb-1 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-bengkel-orange" />
                        <span>Suku Cadang Diganti:</span>
                      </div>
                      <p className="text-bengkel-text">{h.partsReplaced || "Tidak ada part baru"}</p>
                    </div>
                  </div>

                  {/* Next Maintenance Reminder */}
                  {(h.nextMaintenanceDate || h.nextMaintenanceOdometer) && (
                    <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="font-bold text-bengkel-navy flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-bengkel-orange" />
                          <span>Jadwal Servis Berkala Berikutnya:</span>
                        </div>
                        <div className="text-bengkel-muted">
                          {h.nextMaintenanceDate && (
                            <>Disarankan servis kembali pada: <span className="font-bold text-bengkel-navy">{formatIndonesianDate(h.nextMaintenanceDate)}</span></>
                          )}
                          {h.nextMaintenanceOdometer ? (
                            <> {h.nextMaintenanceDate ? "atau" : "Disarankan servis kembali"} saat odometer mencapai <span className="font-bold text-bengkel-navy">{h.nextMaintenanceOdometer.toLocaleString()} km</span>.</>
                          ) : "."}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
