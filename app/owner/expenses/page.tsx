"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TrendingDown, Plus, X, AlertCircle } from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    category: "operasional" as any,
    title: "",
    amount: 100000,
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    notes: "",
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(data.expenses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mencatat pengeluaran.");

      setModalOpen(false);
      setFormData({
        category: "operasional",
        title: "",
        amount: 50000,
        expenseDate: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        notes: "",
      });
      fetchExpenses();
    } catch (err: any) {
      setError(err.message || "Gagal mencatat pengeluaran.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="workshop_owner" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Pengeluaran Kas Operasional"
          subtitle="Catatan biaya listrik, air, sewa, gaji mekanik, dan perlengkapan bengkel"
          currentRole="workshop_owner"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-xs text-bengkel-muted">Total Beban Operasional:</span>
              <span className="text-base font-black text-bengkel-red">{formatRupiah(totalExpenseAmount)}</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pengeluaran Baru</span>
            </button>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Kategori Biaya</th>
                    <th className="py-3 px-4">Deskripsi Pengeluaran</th>
                    <th className="py-3 px-4 text-center">Metode Kas</th>
                    <th className="py-3 px-4 text-right">Nominal Pengeluaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-bengkel-muted">
                        Memuat data pengeluaran...
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-bengkel-muted">
                        Belum ada pengeluaran kas tercatat.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-bengkel-muted">
                          {formatIndonesianDate(exp.expenseDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="capitalize px-2 py-0.5 rounded-full bg-gray-100 font-bold text-gray-700 text-[10px] border border-gray-200">
                            {exp.category.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-bengkel-navy">{exp.title}</div>
                          {exp.notes && <div className="text-[11px] text-gray-400">{exp.notes}</div>}
                        </td>
                        <td className="py-3.5 px-4 text-center capitalize text-bengkel-muted">
                          {exp.paymentMethod.replace("_", " ")}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-bengkel-red">
                          {formatRupiah(exp.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Tambah Pengeluaran */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-bengkel-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Catat Pengeluaran Kas</h3>
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

                <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Kategori Pengeluaran *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs bg-white"
                    >
                      <option value="operasional">Operasional Rutin</option>
                      <option value="listrik_air">Listrik & Air (PLN/PDAM)</option>
                      <option value="gaji">Gaji / Insentif Mekanik</option>
                      <option value="sewa">Sewa Tempat Bengkel</option>
                      <option value="peralatan">Peralatan / Kunci Bengkel</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Judul / Deskripsi Biaya *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Beli Token Listrik PLN"
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Nominal (Rp) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs text-right font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Tanggal *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.expenseDate}
                        onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border text-xs"
                      />
                    </div>
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
                      {submitting ? "Menyimpan..." : "Simpan Biaya"}
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
