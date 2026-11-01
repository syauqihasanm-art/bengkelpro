import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { ShieldCheck, Mail, Phone, MapPin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-bengkel-navy text-gray-300 pt-16 pb-12 border-t border-bengkel-navy-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <span className="text-2xl font-black text-white">Bengkel</span>
              <span className="text-2xl font-black text-bengkel-orange">Pro</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              &quot;Kelola Bengkel Lebih Mudah, Cepat, dan Profesional.&quot;
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Platform SaaS manajemen bengkel otomotif terintegrasi nomor satu di Indonesia. Dirancang khusus untuk bengkel motor, mobil, dan servis umum independen.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-bengkel-green">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Tenant Aman dengan Row Level Security (RLS)</span>
            </div>
          </div>

          {/* Nav Links: Navigasi */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Navigasi</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-bengkel-orange transition-colors">Beranda</Link></li>
              <li><Link href="/features" className="hover:text-bengkel-orange transition-colors">Fitur Unggulan</Link></li>
              <li><Link href="/pricing" className="hover:text-bengkel-orange transition-colors">Paket & Harga</Link></li>
              <li><Link href="/about" className="hover:text-bengkel-orange transition-colors">Tentang BengkelPro</Link></li>
              <li><Link href="/contact" className="hover:text-bengkel-orange transition-colors">Hubungi Tim Kami</Link></li>
            </ul>
          </div>

          {/* Nav Links: Akses Portal */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Portal Pengguna</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/owner/dashboard" className="hover:text-bengkel-orange transition-colors">Dashboard Pemilik (Owner)</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-bengkel-orange transition-colors">Dashboard Kasir / Admin</Link></li>
              <li><Link href="/mechanic/dashboard" className="hover:text-bengkel-orange transition-colors">Portal Mekanik</Link></li>
              <li><Link href="/customer/dashboard" className="hover:text-bengkel-orange transition-colors">Portal Pelanggan</Link></li>
              <li><Link href="/super-admin/dashboard" className="hover:text-bengkel-orange transition-colors">Super Admin Platform</Link></li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Pusat Bantuan</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-bengkel-orange flex-shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-bengkel-orange flex-shrink-0" />
                <span>support@bengkelpro.id</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-bengkel-orange flex-shrink-0 mt-0.5" />
                <span>Jakarta Selatan, DKI Jakarta, Indonesia (WIB)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-bengkel-navy-light flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} BengkelPro Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-6">
            <span>Standar Keamanan SaaS Indonesia (PDP)</span>
            <span>Mata Uang: IDR (Rupiah)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
