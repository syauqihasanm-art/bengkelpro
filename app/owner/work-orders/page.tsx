"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import {
  Wrench,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Car,
  DollarSign,
  Package,
  X,
  Play,
  Check,
  ChevronRight,
} from "lucide-react";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedWO, setSelectedWO] = useState<any | null>(null);

  // Form states for creating new work order
  const [formData, setFormData] = useState({
    customerId: "",
    vehicleId: "",
    odometerIn: 15000,
    customerComplaint: "",
    inspectionFindings: "",
    status: "waiting",
    items: [
      {
        itemType: "service",
        name: "Tune-up & Servis Ringan",
        quantity: 1,
        unitPrice: 75000,
        isApproved: true,
      },
    ],
    discount: 0,
    tax: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [woRes, custRes, vehRes, prodRes] = await Promise.all([
        fetch("/api/work-orders"),
        fetch("/api/customers"),
        fetch("/api/vehicles"),
        fetch("/api/inventory"),
      ]);

      const woData = await woRes.json();
      const custData = await custRes.json();
      const vehData = await vehRes.json();
      const prodData = await prodRes.json();

      setWorkOrders(woData.workOrders || []);
      setCustomers(custData.customers || []);
      setVehicles(vehData.vehicles || []);
      setProducts(prodData.products || []);

      if (custData.customers?.length > 0 && !formData.customerId) {
        setFormData((prev) => ({
          ...prev,
          customerId: custData.customers[0].id,
          vehicleId: vehData.vehicles?.[0]?.id || "",
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formData.customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateWOStatus = async (id: string, status: string, customerApproval?: string) => {
    try {
      const res = await fetch("/api/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          customerApprovalStatus: customerApproval,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Gagal memperbarui status SPK");
        return;
      }

      fetchData();
      if (selectedWO?.id === id) {
        setSelectedWO(json.workOrder);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWO = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat SPK baru.");

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan SPK.");
    } finally {
      setSubmitting(false);
    }
  };

  const addItemToForm = (type: "service" | "part") => {
    if (type === "service") {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            itemType: "service",
            name: "Jasa Ganti Oli Mesin",
            quantity: 1,
            unitPrice: 20000,
            isApproved: true,
          },
        ],
      });
    } else {
      const defaultProd = products[0];
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            itemType: "part",
            name: defaultProd ? defaultProd.name : "Oli Mesin",
            quantity: 1,
            unitPrice: defaultProd ? defaultProd.sellingPrice : 62000,
            isApproved: true,
          },
        ],
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="workshop_owner" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Surat Perintah Kerja (SPK)"
          subtitle="Alur lengkap pekerjaan servis kendaraan, estimasi, dan pemotongan suku cadang aman"
          currentRole="workshop_owner"
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-bengkel-border shadow-2xs">
            <div className="text-xs text-bengkel-muted">
              Total SPK Terdaftar: <span className="font-bold text-bengkel-navy">{workOrders.length}</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat SPK Baru</span>
            </button>
          </div>

          {/* Work Orders Table */}
          <div className="bg-white rounded-xl border border-bengkel-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-bengkel-border text-bengkel-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Nomor SPK</th>
                    <th className="py-3 px-4">Pelanggan & Kendaraan</th>
                    <th className="py-3 px-4">Keluhan & Temuan</th>
                    <th className="py-3 px-4 text-center">Persetujuan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Total Biaya</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                        Memuat data SPK...
                      </td>
                    </tr>
                  ) : workOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-bengkel-muted">
                        Belum ada SPK tercatat.
                      </td>
                    </tr>
                  ) : (
                    workOrders.map((wo) => (
                      <tr key={wo.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-xs text-bengkel-navy bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                            {wo.workOrderNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-bengkel-navy">{wo.customer?.fullName}</div>
                          <div className="text-[11px] text-bengkel-muted">
                            {wo.vehicle?.brand} {wo.vehicle?.model} ({wo.vehicle?.licensePlate})
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="text-bengkel-text font-medium truncate">{wo.customerComplaint}</div>
                          {wo.inspectionFindings && (
                            <div className="text-[11px] text-gray-400 truncate">
                              Temuan: {wo.inspectionFindings}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              wo.customerApprovalStatus === "approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : wo.customerApprovalStatus === "rejected"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {wo.customerApprovalStatus === "approved"
                              ? "Disetujui"
                              : wo.customerApprovalStatus === "rejected"
                              ? "Ditolak"
                              : "Menunggu ACC"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge status={wo.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-bengkel-navy">
                          {formatRupiah(wo.grandTotal)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {wo.customerApprovalStatus === "pending" && (
                              <button
                                onClick={() => handleUpdateWOStatus(wo.id, wo.status, "approved")}
                                className="px-2 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              >
                                ACC Pelanggan
                              </button>
                            )}
                            {wo.status === "waiting" && (
                              <button
                                onClick={() => handleUpdateWOStatus(wo.id, "inspection")}
                                className="px-2 py-1 text-xs font-semibold rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                              >
                                Mulai Inspeksi
                              </button>
                            )}
                            {wo.status === "inspection" && (
                              <button
                                onClick={() => handleUpdateWOStatus(wo.id, "in_progress", "approved")}
                                className="px-2 py-1 text-xs font-semibold rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                              >
                                Kerjakan & Potong Stok
                              </button>
                            )}
                            {wo.status === "in_progress" && (
                              <button
                                onClick={() => handleUpdateWOStatus(wo.id, "completed")}
                                className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                              >
                                Selesai & Buat Faktur
                              </button>
                            )}
                            {wo.status === "completed" && (
                              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Faktur Dibuat</span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Buat SPK Baru */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-bengkel-border space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-bengkel-navy">Buat Surat Perintah Kerja (SPK)</h3>
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

                <form onSubmit={handleCreateWO} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Pilih Pelanggan *
                      </label>
                      <select
                        required
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs bg-white"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullName} ({c.phone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Pilih Kendaraan *
                      </label>
                      <select
                        required
                        value={formData.vehicleId}
                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs bg-white"
                      >
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.licensePlate} — {v.brand} {v.model}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                        Odometer Masuk (km) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={formData.odometerIn}
                        onChange={(e) => setFormData({ ...formData, odometerIn: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Keluhan Pelanggan *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.customerComplaint}
                      onChange={(e) => setFormData({ ...formData, customerComplaint: e.target.value })}
                      placeholder="Keluhan yang dilaporkan customer..."
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-bengkel-text uppercase tracking-wider mb-1">
                      Temuan Inspeksi Awal (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.inspectionFindings}
                      onChange={(e) => setFormData({ ...formData, inspectionFindings: e.target.value })}
                      placeholder="Kondisi part, oli, rem saat dicek mekanik..."
                      className="w-full px-3 py-2 rounded-lg border border-bengkel-border focus:outline-none focus:border-bengkel-orange text-xs"
                    />
                  </div>

                  {/* Line Items: Services & Parts */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-bengkel-navy uppercase tracking-wider">Item Jasa & Suku Cadang</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => addItemToForm("service")}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px]"
                        >
                          + Tambah Jasa
                        </button>
                        <button
                          type="button"
                          onClick={() => addItemToForm("part")}
                          className="px-2.5 py-1 rounded bg-orange-50 text-bengkel-orange hover:bg-orange-100 font-bold text-[11px]"
                        >
                          + Tambah Spare Part
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {formData.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${it.itemType === "service" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                            {it.itemType === "service" ? "JASA" : "PART"}
                          </span>
                          <input
                            type="text"
                            value={it.name}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].name = e.target.value;
                              setFormData({ ...formData, items: newItems });
                            }}
                            className="flex-1 px-2 py-1 rounded border border-gray-200 text-xs bg-white"
                          />
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].quantity = parseInt(e.target.value) || 1;
                              setFormData({ ...formData, items: newItems });
                            }}
                            className="w-14 px-2 py-1 rounded border border-gray-200 text-xs bg-white text-center"
                          />
                          <input
                            type="number"
                            min={0}
                            value={it.unitPrice}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].unitPrice = parseInt(e.target.value) || 0;
                              setFormData({ ...formData, items: newItems });
                            }}
                            className="w-24 px-2 py-1 rounded border border-gray-200 text-xs bg-white text-right"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = formData.items.filter((_, i) => i !== idx);
                              setFormData({ ...formData, items: newItems });
                            }}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
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
                      {submitting ? "Membuat..." : "Terbitkan SPK"}
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
