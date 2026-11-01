import React from "react";
import Link from "next/link";
import { Wrench, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bengkel-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-bengkel-orange flex items-center justify-center mb-6 shadow-xs">
        <Wrench className="w-8 h-8" />
      </div>

      <h1 className="text-5xl font-black text-bengkel-navy tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-bengkel-navy mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-bengkel-muted max-w-md mb-8">
        Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau alamat URL yang Anda masukkan salah.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-md shadow-orange-500/20 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <Link
          href="/owner/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-300 text-bengkel-navy text-xs font-bold hover:bg-gray-50 transition-all"
        >
          <span>Buka Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
