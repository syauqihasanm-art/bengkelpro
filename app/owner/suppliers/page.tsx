"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Truck, Plus, Phone, Mail, MapPin, X, AlertCircle } from "lucide-react";
import { formatIndonesianDate } from "@/lib/utils";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat supplier.");

      setModalOpen(false);
      setFormData({ name: "", contactPerson: "", phone: "", email: "", address: "" });
      fetchSuppliers();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data supplier.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="workshop_owner" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Manajemen Supplier"
          subtitle="Daftar mitra pemasok oli, ban, dan suku cadang bengkel"
          currentRole="workshop_owner"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="text-xs text-bengkel-muted">
              Total Supplier Aktif: <span className="font-bold text-bengkel-navy">{suppliers.length}</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Supplier Baru</span>
            </button>
          </div>

          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-12 text-xs text-bengkel-muted">
                Memuat data supplier...
              </div>
            ) : suppliers.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-xs text-bengkel-muted">
                Belum ada supplier terdaftar.
              </div>
            ) : (
              suppliers.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl p-6 border border-bengkel-border shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-bengkel-orange flex items-center justify-center mb-3">
                      <Truck className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-bengkel-navy">{s.name}</h3>
                    <p className="text-xs text-bengkel-muted font-medium">Kontak PIC: {s.contactPerson}</p>

                    <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs text-bengkel-text">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-bengkel-orange" />
                        <span>{s.phone}</span>
                      </div>
                      {s.email && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{s.email}</span>
                        </div>
                      )}
                      {s.address && (
                        <div className="flex items-start gap-2 text-gray-500">
                          <MapPin className="w-3.5 h-3.5 mt-0.5" />
                          <span className="truncate">{s.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-gray-400">
                    Terdaftar sejak {formatIndonesianDate(s.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal Tambah Supplier */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Tambah Data Supplier Baru</h3>
                  <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-bengkel-red flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nama Perusahaan / Supplier *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="PT Mitra Sparepart Nusantara"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nama PIC / Sales Kontak *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Hendra Wijaya"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nomor Telepon / WA *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="081299887766"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Email (Opsional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="sales@mitra.co.id"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Alamat Gudang / Kantor
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Kawasan Industri Pulogadung..."
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-3.5 py-2 rounded-lg border border-gray-200 text-bengkel-text hover:bg-gray-50 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-bengkel-orange text-white hover:bg-bengkel-orange-hover font-bold shadow-xs"
                    >
                      {submitting ? "Menyimpan..." : "Simpan Supplier"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
