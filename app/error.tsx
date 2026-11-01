"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global boundary caught runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bengkel-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-bengkel-red flex items-center justify-center mb-6 shadow-xs">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-black text-bengkel-navy tracking-tight mb-2">Terjadi Kendala Teknis</h1>
      <p className="text-xs text-bengkel-muted max-w-md mb-6 leading-relaxed">
        Sistem mendeteksi galat yang tidak terduga. Tim keamanan dan DevOps kami telah mencatat peristiwa ini dalam audit log.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bengkel-orange text-white text-xs font-bold hover:bg-bengkel-orange-hover shadow-md shadow-orange-500/20 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Coba Muat Ulang</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-300 text-bengkel-navy text-xs font-bold hover:bg-gray-50 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
