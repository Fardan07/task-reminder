"use client";

import React from "react";
import { CalendarCog, ArrowDown, X } from "lucide-react";

interface HeroOnboardingSectionProps {
  onStartWorking: () => void;
  onOpenScheduleModal: () => void;
  onHideHero: () => void;
}

export const HeroOnboardingSection: React.FC<HeroOnboardingSectionProps> = ({
  onStartWorking,
  onOpenScheduleModal,
  onHideHero,
}) => {
  return (
    <section className="mb-7 space-y-4">
      {/* 1. SMART HERO BANNER */}
      <div className="bg-[#FFFDF9] neo-card overflow-hidden relative">
        {/* Top Checkerboard Strip */}
        <div className="h-2.5 w-full bg-checkerboard border-b-2 border-[#141413]" />

        {/* Decorative Geometric Starburst SVG in Corner */}
        <svg
          viewBox="0 0 120 120"
          className="w-36 h-36 text-[#C8F560] absolute -bottom-8 -right-8 pointer-events-none hidden sm:block"
          fill="currentColor"
          stroke="#141413"
          strokeWidth="3"
          aria-hidden="true"
        >
          <path d="M60 4 L73 42 L112 30 L85 60 L112 90 L73 78 L60 116 L47 78 L8 90 L35 60 L8 30 L47 42 Z" />
        </svg>

        <div className="p-5 sm:p-7 relative z-10">
          {/* Top Bar: Sticker Badge + Collapsible Button */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#DDD6FE] border-2 border-[#141413] rounded-full text-xs font-extrabold text-[#141413] shadow-[2px_2px_0px_#141413] -rotate-1">
              <span>✨ Asisten Sekretaris Kelas • Tanpa Login & 100% Gratis</span>
            </div>

            <button
              type="button"
              onClick={onHideHero}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F3EFE6] hover:bg-[#FF7A59] text-[#141413] border-2 border-[#141413] rounded-full text-xs font-bold shadow-[2px_2px_0px_#141413] cursor-pointer transition-colors"
            >
              <span>Sembunyikan Pengenalan</span>
              <X className="w-3.5 h-3.5 stroke-[2.6]" />
            </button>
          </div>

          {/* Main Headline & Subheadline */}
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#141413] leading-[1.15]">
              Capek Ngetik Reminder Tugas WA Kelas Tiap Malam?
            </h2>
            <p className="text-sm sm:text-base font-semibold text-[#141413]/85 mt-3 leading-relaxed">
              Catat tugas langsung pas guru ngasih di kelas, atur jadwal mapel
              sesukamu, dan salin format teks reminder WhatsApp rapi cuma dalam
              1 klik.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              type="button"
              onClick={onStartWorking}
              className="px-5 py-3 bg-[#FF5A36] hover:bg-[#ff6b4a] text-[#FFFDF9] text-xs sm:text-sm font-extrabold uppercase tracking-tight neo-btn cursor-pointer flex items-center gap-2"
            >
              <span>Mulai Catat Tugas Sekarang</span>
              <ArrowDown className="w-4 h-4 stroke-[2.8]" />
            </button>

            <button
              type="button"
              onClick={onOpenScheduleModal}
              className="px-5 py-3 bg-[#C8F560] hover:bg-[#b8e84b] text-[#141413] text-xs sm:text-sm font-extrabold uppercase tracking-tight neo-btn cursor-pointer flex items-center gap-2"
            >
              <CalendarCog className="w-4 h-4 stroke-[2.5]" />
              <span>Atur Jadwal Kelasmu</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECTION "3 LANGKAH GAMPANG PAKAI SEKREKITA" */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Langkah 01 */}
        <div className="bg-[#C8F560] neo-card-sm p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold bg-[#FFFDF9] text-[#141413] px-3 py-1 border-2 border-[#141413] rounded-xl shadow-[2px_2px_0px_#141413] -rotate-2">
                01
              </span>
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 bg-[#141413] text-[#C8F560] rounded-full">
                Langkah 1
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#141413] tracking-tight">
              Susun Jadwal Kelasmu
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-[#141413]/85 mt-1.5 leading-relaxed">
              Pilih dari dropdown mapel umum atau ketik sendiri mapel
              kejuruan/khusus di kelasmu. Cukup atur 1 kali untuk satu semester!
            </p>
          </div>
        </div>

        {/* Langkah 02 */}
        <div className="bg-[#DDD6FE] neo-card-sm p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold bg-[#FFFDF9] text-[#141413] px-3 py-1 border-2 border-[#141413] rounded-xl shadow-[2px_2px_0px_#141413] rotate-1">
                02
              </span>
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 bg-[#141413] text-[#DDD6FE] rounded-full">
                Langkah 2
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#141413] tracking-tight">
              Catat Draft Tugas di Kelas
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-[#141413]/85 mt-1.5 leading-relaxed">
              Pas guru ngasih tugas, langsung klik mapelnya dan ketik poin tugas
              atau tempel link Notion/Drive. Gak bakal lupa lagi tugas minggu
              depan!
            </p>
          </div>
        </div>

        {/* Langkah 03 */}
        <div className="bg-[#FF7A59] neo-card-sm p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold bg-[#FFFDF9] text-[#141413] px-3 py-1 border-2 border-[#141413] rounded-xl shadow-[2px_2px_0px_#141413] -rotate-1">
                03
              </span>
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 bg-[#141413] text-[#FFFDF9] rounded-full">
                Langkah 3
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#141413] tracking-tight">
              1-Klik Kirim ke Grup WA
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-[#141413]/90 mt-1.5 leading-relaxed">
              Besoknya, teks reminder WhatsApp otomatis siap! Mapel kosong
              otomatis tertulis (- -), tinggal klik Salin atau Kirim ke WA.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

