"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Sparkles, Send, Bot, User, AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string; isLive?: boolean }[]
  >([
    {
      role: "assistant",
      text: "Halo! Saya Asisten Pintar Otomotif BengkelPro. Anda dapat bertanya tentang diagnosa keluhan suara kendaraan, saran checklist inspeksi mekanik, atau pembuatan ringkasan SPK.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusInfo, setStatusInfo] = useState<string | null>(null);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          featureType: "diagnose",
        }),
      });

      const data = await res.json();
      if (data.message) {
        setStatusInfo(data.message);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.response || data.error || "Gagal memperoleh respons.",
          isLive: data.isLiveAI,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Terjadi kesalahan teknis saat menghubungi server asisten AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "Motor Vario 160 gredek saat tarikan awal di rpm rendah, apa penyebab dan tindakan mekanik?",
    "Piringan rem depan berdecit saat diinjak, langkah inspeksi apa yang diperlukan?",
    "Motor mogok setelah menerjang banjir, checklist apa yang harus diperiksa pertama kali?",
  ];

  return (
    <div className="flex min-h-screen bg-bengkel-bg">
      <Sidebar role="workshop_owner" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Asisten AI Otomotif BengkelPro"
          subtitle="Konsultasi diagnosa keluhan, panduan inspeksi mekanik, dan wawasan teknis otomotif"
          currentRole="workshop_owner"
        />

        <main className="flex-1 p-6 space-y-4 max-w-4xl w-full mx-auto flex flex-col">
          {/* Status Alert Banner */}
          {statusInfo && (
            <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-bengkel-navy flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-bengkel-orange flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Info Integrasi AI: </span>
                <span>{statusInfo}</span>
              </div>
            </div>
          )}

          {/* Chat Messages Container */}
          <div className="flex-1 bg-white rounded-2xl border border-bengkel-border shadow-xs p-6 overflow-y-auto space-y-4 min-h-[450px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-bengkel-orange text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-bengkel-navy text-white rounded-tr-none font-medium"
                      : "bg-bengkel-bg border border-bengkel-border text-bengkel-text rounded-tl-none whitespace-pre-line"
                  }`}
                >
                  {m.text}
                </div>

                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-bengkel-navy text-white flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-bengkel-orange text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-bengkel-muted rounded-tl-none flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-bengkel-orange animate-spin" />
                  <span>Menganalisis keluhan otomotif...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-bengkel-muted uppercase tracking-wider">
              Contoh Pertanyaan Cepat:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(q);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-bengkel-orange hover:bg-orange-50 text-[11px] text-bengkel-navy text-left transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan keluhan mesin, bunyi, kode error OBD, atau checklist servis..."
              className="flex-1 px-4 py-3 rounded-xl border border-bengkel-border text-sm focus:outline-none focus:border-bengkel-orange bg-white shadow-xs"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-bengkel-orange hover:bg-bengkel-orange-hover text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>Kirim</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
