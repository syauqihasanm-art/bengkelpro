import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Wrench, Target, Compass, Award, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bengkel-bg flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-bengkel-orange uppercase tracking-wider">Tentang BengkelPro</span>
          <h1 className="text-4xl font-black text-bengkel-navy tracking-tight">
            Mendigitalkan Ekosistem Bengkel Otomotif Nusantara
          </h1>
          <p className="text-base text-bengkel-muted leading-relaxed">
            &quot;Kelola Bengkel Lebih Mudah, Cepat, dan Profesional.&quot;
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-bengkel-border shadow-xs space-y-8">
          <div>
            <h2 className="text-xl font-black text-bengkel-navy mb-3 flex items-center gap-2">
              <Compass className="w-5 h-5 text-bengkel-orange" />
              <span>Visi Produk Kami</span>
            </h2>
            <p className="text-sm text-bengkel-muted leading-relaxed">
              Membangun platform digital terintegrasi yang memberdayakan ribuan bengkel motor dan mobil independen di seluruh pelosok Indonesia. Menghubungkan pemilik, kasir, mekanik handal, dan pemilik kendaraan dalam satu alur kerja transparan dan efisien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div className="p-6 rounded-xl bg-bengkel-bg border border-bengkel-border">
              <Target className="w-6 h-6 text-bengkel-orange mb-3" />
              <h3 className="text-base font-bold text-bengkel-navy mb-2">Misi Utama</h3>
              <ul className="text-xs text-bengkel-muted space-y-2 leading-relaxed">
                <li>• Menghilangkan kebocoran stok spare part dengan audit mutasi transaksional.</li>
                <li>• Mempermudah pelanggan booking servis dan melihat riwayat perbaikan kendaraannya.</li>
                <li>• Memberikan laporan keuangan laba/rugi yang akurat tanpa spekulasi angka.</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-bengkel-bg border border-bengkel-border">
              <ShieldCheck className="w-6 h-6 text-bengkel-green mb-3" />
              <h3 className="text-base font-bold text-bengkel-navy mb-2">Nilai Keamanan Data</h3>
              <ul className="text-xs text-bengkel-muted space-y-2 leading-relaxed">
                <li>• Multi-tenant ketat: Satu bengkel tidak dapat melihat data privat bengkel lain.</li>
                <li>• Row Level Security (RLS) PostgreSQL standar perbankan.</li>
                <li>• Mematuhi regulasi perlindungan data pribadi dan sistem elektronik di Indonesia.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
