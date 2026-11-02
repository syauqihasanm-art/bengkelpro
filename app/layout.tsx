import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { QuickFeatureLauncher } from "@/components/QuickFeatureLauncher";

export const metadata: Metadata = {
  title: "BengkelPro — Smart Automotive Workshop Management System",
  description: "Kelola Bengkel Lebih Mudah, Cepat, dan Profesional. Platform SaaS manajemen operasional bengkel terintegrasi di Indonesia.",
  keywords: ["bengkel motor", "bengkel mobil", "software bengkel", "manajemen bengkel", "bengkel SaaS indonesia", "work order bengkel", "suku cadang"],
  authors: [{ name: "BengkelPro Engineering Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔧</text></svg>" />
      </head>
      <body className="min-h-full flex flex-col bg-bengkel-bg text-bengkel-text antialiased">
        {children}
        <QuickFeatureLauncher />
      </body>
    </html>
  );
}
