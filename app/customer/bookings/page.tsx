"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { Calendar, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data.bookings || []))
      .catch(console.error);
  }, []);

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="customer" userName="Rudi Hermawan" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Booking Servis Kendaraan"
          subtitle="Jadwal reservasi kedatangan Anda di bengkel"
          currentRole="customer"
        />

        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-6 border border-bengkel-border shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-orange-50 text-bengkel-orange px-2.5 py-1 rounded-md border border-orange-200">
                      {b.bookingCode}
                    </span>
                    <Badge status={b.status} />
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-bengkel-navy">
                      {b.vehicle?.brand} {b.vehicle?.model} ({b.vehicle?.licensePlate})
                    </h3>
                    <p className="text-xs text-bengkel-muted mt-0.5">Keluhan: {b.customerComplaint}</p>
                  </div>
                </div>

                <div className="sm:text-right space-y-1 text-xs">
                  <div className="font-bold text-bengkel-navy flex items-center gap-1 sm:justify-end">
                    <Calendar className="w-3.5 h-3.5 text-bengkel-orange" />
                    <span>{formatIndonesianDate(b.serviceDate)}</span>
                  </div>
                  <div className="text-gray-500 flex items-center gap-1 sm:justify-end">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pukul {b.timeSlot} WIB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
