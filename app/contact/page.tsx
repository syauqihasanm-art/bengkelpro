"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Phone, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bengkel-bg flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-bold text-bengkel-orange uppercase tracking-wider">Layanan Bantuan</span>
          <h1 className="text-4xl font-black text-bengkel-navy tracking-tight">Hubungi Tim BengkelPro</h1>
          <p className="text-sm text-bengkel-muted">
            Konsultasikan kebutuhan operasional bengkel Anda bersama spesialis kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-bengkel-border shadow-xs">
              <Phone className="w-5 h-5 text-bengkel-orange mb-2" />
              <div className="text-xs text-bengkel-muted">Telepon & WhatsApp</div>
              <div className="text-sm font-bold text-bengkel-navy mt-0.5">+62 812-3456-7890</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-bengkel-border shadow-xs">
              <Mail className="w-5 h-5 text-bengkel-orange mb-2" />
              <div className="text-xs text-bengkel-muted">Email Resmi</div>
              <div className="text-sm font-bold text-bengkel-navy mt-0.5">support@bengkelpro.id</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-bengkel-border shadow-xs">
              <MapPin className="w-5 h-5 text-bengkel-orange mb-2" />
              <div className="text-xs text-bengkel-muted">Lokasi Operasional</div>
              <div className="text-sm font-bold text-bengkel-navy mt-0.5">Jakarta Selatan, DKI Jakarta</div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-bengkel-border shadow-xs">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-bengkel-green mx-auto" />
                <h3 className="text-xl font-bold text-bengkel-navy">Pesan Berhasil Terkirim!</h3>
                <p className="text-xs text-bengkel-muted max-w-sm mx-auto">
                  Tim kami akan merespons pertanyaan Anda via WhatsApp / email dalam waktu 1x24 jam kerja.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama Anda"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:border-bengkel-orange"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:border-bengkel-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nomor HP/WA *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:border-bengkel-orange"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-bengkel-text uppercase tracking-wider mb-1">
                    Pesan / Pertanyaan *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Ceritakan tentang bengkel Anda atau pertanyaan teknis..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:border-bengkel-orange"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-bengkel-orange hover:bg-bengkel-orange-hover shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
