"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  History,
  X,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"catalog" | "movements">("catalog");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [productForm, setProductForm] = useState({
    sku: "",
    name: "",
    brand: "",
    purchasePrice: 45000,
    sellingPrice: 60000,
    stockQuantity: 10,
    minStock: 5,
    unit: "pcs",
  });

  const [adjustForm, setAdjustForm] = useState({
    movementType: "in" as "in" | "out" | "adjustment",
    quantity: 5,
    notes: "Restock tambahan gudang",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory?includeMovements=true&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setProducts(data.products || []);
      setMovements(data.movements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah produk.");

      setProductModalOpen(false);
      setProductForm({
        sku: "",
        name: "",
        brand: "",
        purchasePrice: 0,
        sellingPrice: 0,
        stockQuantity: 0,
        minStock: 5,
        unit: "pcs",
      });
      fetchData();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan produk.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust",
          productId: selectedProduct.id,
          ...adjustForm,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyesuaikan stok.");

      setAdjustModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Gagal menyesuaikan stok.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="workshop_owner" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Stok & Inventaris Suku Cadang"
          subtitle="Katalog spare part, harga beli, harga jual, dan catatan mutasi stok"
          currentRole="workshop_owner"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("catalog")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === "catalog"
                    ? "bg-bengkel-orange text-white"
                    : "bg-gray-100 text-bengkel-text hover:bg-gray-200"
                }`}
              >
                Katalog Produk ({products.length})
              </button>
              <button
                onClick={() => setActiveTab("movements")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === "movements"
                    ? "bg-bengkel-orange text-white"
                    : "bg-gray-100 text-bengkel-text hover:bg-gray-200"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Riwayat Mutasi Stok ({movements.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari SKU atau nama part..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-bengkel-border text-xs focus:outline-none focus:border-bengkel-orange"
                />
              </div>

              <button
                onClick={() => setProductModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Part Baru</span>
              </button>
            </div>
          </div>

          {activeTab === "catalog" ? (
            /* Catalog Table */
            <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-3 px-4">SKU / Kode Part</th>
                      <th className="py-3 px-4">Nama Suku Cadang</th>
                      <th className="py-3 px-4">Merk</th>
                      <th className="py-3 px-4 text-right">Harga Beli (HPP)</th>
                      <th className="py-3 px-4 text-right">Harga Jual</th>
                      <th className="py-3 px-4 text-center">Stok Fisik</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                          Memuat data suku cadang...
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                          Belum ada suku cadang terdaftar.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => {
                        const isLowStock = p.stockQuantity <= p.minStock;
                        return (
                          <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-xs text-bengkel-navy">
                              {p.sku}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-bengkel-navy">
                              {p.name}
                            </td>
                            <td className="py-3.5 px-4 text-bengkel-muted">
                              {p.brand}
                            </td>
                            <td className="py-3.5 px-4 text-right text-bengkel-muted">
                              {formatRupiah(p.purchasePrice)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-bengkel-navy">
                              {formatRupiah(p.sellingPrice)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  isLowStock
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                {isLowStock && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                                <span>{p.stockQuantity} {p.unit}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedProduct(p);
                                  setAdjustModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-200 hover:bg-gray-50 text-bengkel-navy transition-colors"
                              >
                                Sesuaikan Stok
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Stock Movements Table */
            <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-3 px-4">Waktu Mutasi</th>
                      <th className="py-3 px-4">Nama Produk</th>
                      <th className="py-3 px-4 text-center">Tipe Mutasi</th>
                      <th className="py-3 px-4 text-center">Perubahan</th>
                      <th className="py-3 px-4 text-center">Sebelum → Sesudah</th>
                      <th className="py-3 px-4">Keterangan / Dokumen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {movements.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-bengkel-muted text-[11px]">
                          {formatIndonesianDate(m.createdAt, true)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-bengkel-navy">
                          {m.productName || "Suku Cadang"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              m.movementType === "in"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : m.movementType === "out"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {m.movementType === "in" ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            <span>{m.movementType === "in" ? "Masuk" : m.movementType === "out" ? "Keluar" : "Penyesuaian"}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">
                          {m.movementType === "out" ? `-${m.quantity}` : `+${m.quantity}`}
                        </td>
                        <td className="py-3.5 px-4 text-center text-bengkel-muted font-mono">
                          {m.previousStock} → <span className="font-bold text-bengkel-navy">{m.currentStock}</span>
                        </td>
                        <td className="py-3.5 px-4 text-bengkel-text">
                          {m.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal Tambah Produk Baru */}
          {productModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Tambah Suku Cadang Baru</h3>
                  <button onClick={() => setProductModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-bengkel-red flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Kode SKU *
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                        placeholder="OIL-SHL-10W40"
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs uppercase"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Merk Part *
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        placeholder="Shell / AHM / Denso"
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Nama Suku Cadang *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Oli Shell Advance AX7 10W-40"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Harga Beli (HPP) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={productForm.purchasePrice}
                        onChange={(e) => setProductForm({ ...productForm, purchasePrice: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Harga Jual *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={productForm.sellingPrice}
                        onChange={(e) => setProductForm({ ...productForm, sellingPrice: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Stok Awal
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={productForm.stockQuantity}
                        onChange={(e) => setProductForm({ ...productForm, stockQuantity: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Batas Minimum
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={productForm.minStock}
                        onChange={(e) => setProductForm({ ...productForm, minStock: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Satuan
                      </label>
                      <input
                        type="text"
                        value={productForm.unit}
                        onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs text-center"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setProductModalOpen(false)}
                      className="px-3.5 py-2 rounded-lg border border-gray-200 text-bengkel-text hover:bg-gray-50 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-bengkel-orange text-white hover:bg-bengkel-orange-hover font-bold shadow-xs"
                    >
                      {submitting ? "Menyimpan..." : "Simpan Suku Cadang"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Penyesuaian Stok (Adjust Stock) */}
          {adjustModalOpen && selectedProduct && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Penyesuaian Stok Part</h3>
                  <button onClick={() => setAdjustModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <div className="font-bold text-bengkel-navy">{selectedProduct.name}</div>
                  <div className="text-bengkel-muted mt-0.5">
                    Stok Saat Ini: <span className="font-bold text-bengkel-navy">{selectedProduct.stockQuantity} {selectedProduct.unit}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-bengkel-red flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleAdjustStock} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Jenis Penyesuaian
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setAdjustForm({ ...adjustForm, movementType: "in" })}
                        className={`py-1.5 rounded-lg border font-bold text-center ${
                          adjustForm.movementType === "in"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                      >
                        + Masuk
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustForm({ ...adjustForm, movementType: "out" })}
                        className={`py-1.5 rounded-lg border font-bold text-center ${
                          adjustForm.movementType === "out"
                            ? "bg-rose-50 text-rose-700 border-rose-300"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                      >
                        - Keluar
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustForm({ ...adjustForm, movementType: "adjustment" })}
                        className={`py-1.5 rounded-lg border font-bold text-center ${
                          adjustForm.movementType === "adjustment"
                            ? "bg-blue-50 text-blue-700 border-blue-300"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                      >
                        = Set Nilai
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Jumlah {adjustForm.movementType === "adjustment" ? "Stok Baru" : "Penambahan/Pengurangan"} *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={adjustForm.quantity}
                      onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Alasan / Keterangan Mutasi *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={adjustForm.notes}
                      onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                      placeholder="Contoh: Stok opname akhir bulan / part rusak..."
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setAdjustModalOpen(false)}
                      className="px-3.5 py-2 rounded-lg border border-gray-200 text-bengkel-text hover:bg-gray-50 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-bengkel-orange text-white hover:bg-bengkel-orange-hover font-bold shadow-xs"
                    >
                      {submitting ? "Memproses..." : "Konfirmasi Mutasi"}
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
