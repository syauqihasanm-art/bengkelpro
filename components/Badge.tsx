import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({ status, className = "", size = "md" }: BadgeProps) {
  const normalized = status.toLowerCase();

  let colorClasses = "bg-gray-100 text-gray-800 border-gray-200";
  let label = status;

  switch (normalized) {
    // Work Orders & Bookings
    case "waiting":
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
      label = "Menunggu Pengerjaan";
      break;
    case "pending":
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
      label = "Menunggu";
      break;
    case "confirmed":
      colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
      label = "Terkonfirmasi";
      break;
    case "checked_in":
      colorClasses = "bg-indigo-50 text-indigo-700 border-indigo-200";
      label = "Check-in";
      break;
    case "inspection":
      colorClasses = "bg-purple-50 text-purple-700 border-purple-200";
      label = "Inspeksi";
      break;
    case "waiting_approval":
      colorClasses = "bg-orange-50 text-orange-700 border-orange-200";
      label = "Menunggu Persetujuan";
      break;
    case "in_progress":
    case "in_service":
      colorClasses = "bg-sky-50 text-sky-700 border-sky-200";
      label = "Sedang Dikerjakan";
      break;
    case "waiting_parts":
      colorClasses = "bg-yellow-50 text-yellow-700 border-yellow-200";
      label = "Menunggu Part";
      break;
    case "work_done":
      colorClasses = "bg-teal-50 text-teal-700 border-teal-200";
      label = "Selesai Dikerjakan";
      break;
    case "awaiting_payment":
      colorClasses = "bg-orange-50 text-orange-700 border-orange-200";
      label = "Menunggu Pembayaran";
      break;
    case "completed":
    case "delivered":
    case "approved":
    case "active":
    case "success":
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
      label = normalized === "completed" ? "Selesai" : normalized === "delivered" ? "Diambil" : normalized === "approved" ? "Disetujui" : "Aktif";
      break;
    case "cancelled":
    case "rejected":
    case "suspended":
    case "failed":
      colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
      label = normalized === "cancelled" ? "Dibatalkan" : normalized === "rejected" ? "Ditolak" : normalized === "suspended" ? "Ditangguhkan" : "Gagal";
      break;

    // Payments & Invoices
    case "paid":
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
      label = "Lunas";
      break;
    case "unpaid":
      colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
      label = "Belum Bayar";
      break;
    case "partially_paid":
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
      label = "Sebagian";
      break;
    case "draft":
      colorClasses = "bg-gray-100 text-gray-700 border-gray-200";
      label = "Draf";
      break;
    default:
      label = status;
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-full border tracking-wide select-none",
        sizeClasses,
        colorClasses,
        className
      )}
    >
      {label}
    </span>
  );
}
