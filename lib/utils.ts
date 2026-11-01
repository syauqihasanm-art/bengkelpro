import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number into Indonesian Rupiah (IDR)
 * Example: 150000 -> "Rp 150.000"
 */
export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "Rp 0";
  }
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format ISO date string into Indonesian standard date format
 * Example: "2026-11-01" -> "1 November 2026"
 */
export function formatIndonesianDate(dateInput: string | Date | null | undefined, includeTime: boolean = false): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  };

  return new Intl.DateTimeFormat("id-ID", options).format(date);
}

/**
 * Safe calculation of financial totals to avoid floating point inaccuracies
 */
export function calculateTotals(items: { quantity: number; unitPrice: number }[], discount = 0, taxRate = 0) {
  const subtotal = items.reduce((sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice), 0);
  const discountAmount = Math.min(subtotal, Math.max(0, discount));
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(afterDiscount * (Math.max(0, taxRate) / 100));
  const grandTotal = afterDiscount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal,
  };
}
