"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { ShoppingCart, Plus, CheckCircle2, PackageCheck, AlertCircle, X } from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    supplierId: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    items: [
      {
        productId: "",
        quantity: 10,
        unitCost: 48000,
      },
    ],
    notes: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [poRes, supRes, prodRes] = await Promise.all([
        fetch("/api/suppliers?type=purchases"),
        fetch("/api/suppliers"),
        fetch("/api/inventory"),
      ]);

      const poData = await poRes.json();
      const supData = await supRes.json();
      const prodData = await prodRes.json();

      setPurchases(poData.purchases || []);
      setSuppliers(supData.suppliers || []);
      setProducts(prodData.products || []);

      if (supData.suppliers?.length > 0 && !formData.supplierId) {
        setFormData((prev) => ({
          ...prev,
          supplierId: supData.suppliers[0].id,
          items: [{ productId: prodData.products?.[0]?.id || "", quantity: 10, unitCost: 48000 }],
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formData.supplierId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReceiveGoods = async (purchaseId: string) => {
    if (!confirm("Konfirmasi penerimaan barang? Stok gudang akan otomatis bertambah sesuai item pada PO ini.")) {
      return;
    }

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "receive",
          purchaseId,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengonfirmasi penerimaan barang.");

      alert("Barang berhasil diterima! Stok suku cadang telah bertambah di gudang.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal memproses penerimaan.");
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_po",
          ...formData,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat Purchase Order.");

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Gagal membuat PO.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="workshop_owner" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Pengadaan & Purchase Order (PO)"
          subtitle="Pemesanan suku cadang ke supplier dan verifikasi penerimaan barang fisik"
          currentRole="workshop_owner"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="text-xs text-bengkel-muted">
              Total Purchase Orders: <span className="font-bold text-bengkel-navy">{purchases.length}</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Purchase Order Baru</span>
            </button>
          </div>

          {/* Purchases Table */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Nomor PO</th>
                    <th className="py-3 px-4">Nama Supplier</th>
                    <th className="py-3 px-4">Tanggal Pengadaan</th>
                    <th className="py-3 px-4 text-center">Status Barang</th>
                    <th className="py-3 px-4 text-right">Total Nilai PO</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-bengkel-muted">
                        Memuat data PO...
                      </td>
                    </tr>
                  ) : purchases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-bengkel-muted">
                        Belum ada purchase order dibuat.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((po) => (
                      <tr key={po.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-bengkel-navy">
                          {po.purchaseNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-bengkel-navy">
                          {po.supplierName || "Supplier"}
                        </td>
                        <td className="py-3.5 px-4 text-bengkel-muted">
                          {formatIndonesianDate(po.purchaseDate)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                              po.status === "received"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {po.status === "received" ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Barang Diterima & Masuk Stok</span>
                              </>
                            ) : (
                              <span>Menunggu Pengiriman</span>
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-bengkel-navy">
                          {formatRupiah(po.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {po.status !== "received" && (
                            <button
                              onClick={() => handleReceiveGoods(po.id)}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 ml-auto"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Konfirmasi Terima Barang</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Buat PO */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Buat Purchase Order Baru</h3>
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

                <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Pilih Supplier Pemasok *
                    </label>
                    <select
                      required
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs bg-white"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.contactPerson})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Pilih Produk Spare Part *
                    </label>
                    <select
                      required
                      value={formData.items[0]?.productId}
                      onChange={(e) => {
                        const prod = products.find((p) => p.id === e.target.value);
                        setFormData({
                          ...formData,
                          items: [
                            {
                              productId: e.target.value,
                              quantity: formData.items[0]?.quantity || 10,
                              unitCost: prod ? prod.purchasePrice : 45000,
                            },
                          ],
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs bg-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (HPP: {formatRupiah(p.purchasePrice)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Jumlah Pembelian *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formData.items[0]?.quantity}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 1;
                          setFormData({
                            ...formData,
                            items: [{ ...formData.items[0], quantity: qty }],
                          });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs text-center"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Harga Beli Satuan (Rp) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={formData.items[0]?.unitCost}
                        onChange={(e) => {
                          const cost = parseInt(e.target.value) || 0;
                          setFormData({
                            ...formData,
                            items: [{ ...formData.items[0], unitCost: cost }],
                          });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs text-right"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                    <span className="text-bengkel-muted font-medium">Total Estimasi PO:</span>
                    <span className="font-bold text-bengkel-navy text-sm">
                      {formatRupiah((formData.items[0]?.quantity || 0) * (formData.items[0]?.unitCost || 0))}
                    </span>
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
                      {submitting ? "Membuat..." : "Terbitkan PO"}
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
