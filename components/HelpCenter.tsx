"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";
import FaqSection from "./FaqSection";

export default function HelpCenter() {
  const [openChat, setOpenChat] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8fcfc] via-white to-[#f0f6f6] pt-28 pb-20">
      {/* HERO BANTUAN */}
      <section className="max-w-5xl mx-auto px-6 md:px-10 lg:px-0 mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-[#0FA3A8] bg-[#e3f6f6] px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0FA3A8]" />
          Pusat Bantuan KOJE24
        </div>

        <div className="grid md:grid-cols-[1.6fr,1.1fr] gap-8 items-start">
          {/* teks kiri */}
          <div>
            <h1 className="font-playfair text-3xl md:text-4xl lg:text-[2.7rem] leading-tight text-[#061215] mb-4">
              Ada pertanyaan tentang{" "}
              <span className="text-[#0FA3A8]">KOJE24</span>?
            </h1>
            <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed mb-6">
              Di sini kamu bisa menemukan jawaban seputar varian jus, manfaat,
              cara pemesanan, pengiriman, hingga cara penyimpanan yang benar.
              Kalau masih bingung, kamu bisa ngobrol langsung dengan{" "}
              <span className="font-semibold">KOJE24 Assistant</span>.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setOpenChat(true)}
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0FA3A8] to-[#0b6f74] shadow-lg shadow-[#0FA3A8]/25 hover:shadow-xl hover:brightness-110 transition-all"
              >
                Buka KOJE24 Assistant
              </button>
              <p className="text-xs text-slate-500">
                Online • jawab dalam hitungan detik
              </p>
            </div>
          </div>

          {/* kartu kanan */}
          <div className="bg-white rounded-3xl border border-[#e4f2f2] shadow-[0_18px_45px_rgba(9,34,40,0.08)] p-5 md:p-6 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold text-[#0FA3A8] mb-1">
                Rekomendasi cepat
              </p>
              <h2 className="text-base font-semibold text-[#062126] mb-2">
                Pertanyaan yang paling sering ditanyakan
              </h2>
              <p className="text-xs text-slate-500">
                Misalnya: “Yang cocok buat maag apa?”, “Kalau buat imun
                harian?”, atau “Cara order paket langganan gimana?”.
              </p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between rounded-2xl border border-[#e5f2f2] bg-[#f7fcfc] px-3 py-2">
                <span className="text-slate-700">
                  • Pilih varian sesuai kebutuhan harian
                </span>
                <span className="text-[11px] text-[#0FA3A8] font-medium">
                  Detox / Imun / Maag
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[#e5f2f2] bg-[#f7fcfc] px-3 py-2">
                <span className="text-slate-700">
                  • Chat kalau butuh rekomendasi personal
                </span>
                <span className="text-[11px] text-[#0FA3A8] font-medium">
                  1–2 menit saja
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ (pakai komponen yang sudah ada) */}
      <section className="max-w-5xl mx-auto px-6 md:px-10 lg:px-0">
        <FaqSection />

        <div className="mt-6 text-center text-sm text-slate-600">
          Masih belum ketemu jawabannya?{" "}
          <button
            type="button"
            onClick={() => setOpenChat(true)}
            className="inline-flex items-center gap-1 font-semibold text-[#0FA3A8] hover:text-[#0b7f84] underline-offset-4 hover:underline"
          >
            Buka KOJE24 Assistant
          </button>
        </div>
      </section>

      {/* Chat window hanya muncul kalau openChat = true */}
      {openChat && <ChatWindow onClose={() => setOpenChat(false)} />}
    </main>
  );
}
