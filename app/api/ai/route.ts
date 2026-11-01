import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, featureType = "diagnose", vehicleInfo } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt pertanyaan wajib diisi." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Strict compliance with Section C & Section H Module 14:
    // If GEMINI_API_KEY is not configured, inform the user with exact instructions
    if (!apiKey) {
      // Deterministic expert knowledge base for common symptoms when offline / testing
      const offlineAnswers: Record<string, string> = {
        gredek:
          "Gejala getar / 'gredek' pada rpm rendah pada motor matic umumnya disebabkan oleh kotoran atau debu kampas ganda yang menumpuk di mangkok kopling CVT, atau keausan seal kruk as yang memicu rembesan oli. Rekomendasi tindakan mekanik: Lakukan servis CVT, bersihkan mangkok ganda, periksa ketebalan kampas ganda, dan cek kondisi roller.",
        rem:
          "Gejala bunyi berdecit saat pengereman biasanya menandakan kampas rem sudah menipis hingga mendekati indikator besi pembatas, atau terdapat kotoran pasir/debu di piringan cakram (disc brake). Rekomendasi tindakan mekanik: Periksa ketebalan sisa kampas rem secara langsung dengan sigmat/jangka sorong dan bersihkan kaliper.",
        mogok:
          "Kendaraan mogok mendadak memerlukan pemeriksaan bertahap pada 3 unsur utama mesin pembakaran: 1) Pengapian (busi, koil, CDI/ECU), 2) Pasokan bahan bakar (pompa bensin, injector/karburator, filter bensin), 3) Kompresi silinder. Rekomendasi: Lakukan pengecekan fisik langsung oleh mekanik.",
      };

      const lowerPrompt = prompt.toLowerCase();
      let matchedAdvice = "";
      for (const key of Object.keys(offlineAnswers)) {
        if (lowerPrompt.includes(key)) {
          matchedAdvice = offlineAnswers[key];
          break;
        }
      }

      return NextResponse.json({
        response: matchedAdvice
          ? `[Mode Pengetahuan Standar BengkelPro]\n\n${matchedAdvice}\n\n*Catatan Keamanan: Diagnosa ini merupakan analisis awal berbasis gejala umum. Rekomendasikan pelanggan agar kendaraan dicek langsung di pit servis oleh mekanik bengkel.*`
          : `[Mode Pengetahuan Standar BengkelPro]\n\nUntuk keluhan "${prompt}": Disarankan mekanik memeriksa komponen penggerak, sistem pengapian, dan oli pelumas secara berurutan.\n\n*Catatan: Konfigurasikan GEMINI_API_KEY di file .env.local untuk mengaktifkan AI Generatif dinamis Google Gemini.*`,
        isLiveAI: false,
        apiKeyConfigured: false,
        message: "GEMINI_API_KEY belum dikonfigurasi di environment. Menggunakan basis pengetahuan internal otomotif.",
      });
    }

    // Call Gemini API server-side
    const systemPrompt = `Anda adalah Asisten Ahli Otomotif BengkelPro Indonesia.
Tugas Anda: Membantu mekanik dan pemilik bengkel menganalisis keluhan kendaraan, memberikan checklist inspeksi, dan saran teknis.
Aturan Wajib:
1. Berkomunikasi selalu dalam Bahasa Indonesia yang profesional dan mudah dipahami.
2. Bedakan antara kemungkinan umum dan temuan mekanik yang terbukti.
3. Selalu sarankan pemeriksaan fisik langsung oleh mekanik bersertifikat.
4. Jangan pernah menyatakan kepastian 100% tanpa inspeksi visual/alat ukur mekanik.
5. Jangan pernah mengubah status pembayaran, stok suku cadang, atau persetujuan SPK.`;

    const fullPrompt = `${systemPrompt}\n\nFitur: ${featureType}\nInformasi Kendaraan: ${vehicleInfo || "Umum"}\nPertanyaan/Keluhan: ${prompt}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
      }),
    });

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      throw new Error("Gagal memperoleh respons dari Gemini API");
    }

    return NextResponse.json({
      response: reply,
      isLiveAI: true,
      apiKeyConfigured: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || "Gagal memproses permintaan asisten AI",
        isLiveAI: false,
      },
      { status: 500 }
    );
  }
}
