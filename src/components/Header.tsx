"use client";

import React from "react";
import { CalendarCog, RotateCcw, CheckSquare, Lightbulb } from "lucide-react";

interface HeaderProps {
  classNameLabel: string;
  activeSubjectCount: number;
  isHeroVisible: boolean;
  isScheduleConfigured: boolean;
  onToggleHero: () => void;
  onOpenScheduleModal: () => void;
  onResetAllData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  classNameLabel,
  activeSubjectCount,
  isHeroVisible,
  isScheduleConfigured,
  onToggleHero,
  onOpenScheduleModal,
  onResetAllData,
}) => {
  return (
    <header className="w-full bg-[#FFFDF9] border-b-2 border-[#141413] sticky top-0 z-30">
      {/* Top Strip */}
      <div className="h-1.5 w-full bg-hazard-stripes border-b-2 border-[#141413]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Brand & SEKREKITA Logo */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[#C8F560] border-2 border-[#141413] rounded-xl shadow-[3px_3px_0px_#141413] flex items-center justify-center shrink-0 relative -rotate-2">
              <svg
                viewBox="0 0 32 32"
                className="w-7 h-7 text-[#141413]"
                fill="currentColor"
                stroke="#141413"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M16 2 L19.2 11.2 L28 8 L22.4 15.2 L30 20 L20.4 20.8 L22 30 L15.2 22.8 L8 28 L11.2 19.2 L2 16 L11.2 12.8 L6 4 L14.4 9.6 Z" />
              </svg>
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#FF5A36] border-2 border-[#141413] rounded-full" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#141413] uppercase flex items-center">
                  <span className="bg-[#141413] text-[#C8F560] px-2 py-0.5 border-2 border-[#141413] rounded-md mr-1">
                    SEKRE
                  </span>
                  <span className="italic font-extrabold underline decoration-[#FF5A36] decoration-2 underline-offset-4">
                    KITA
                  </span>
                </h1>

                {/* Physical Sticker Class Badge */}
                <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-[#DDD6FE] border-2 border-[#141413] rounded-full text-xs font-extrabold uppercase shadow-[2px_2px_0px_#141413] -rotate-2">
                  <span className="text-[#FF5A36]">✦</span>
                  <span>
                    {isScheduleConfigured && classNameLabel
                      ? classNameLabel
                      : "Kelas Belum Diatur"}
                  </span>
                </span>
              </div>

              <p className="text-xs font-semibold text-[#141413]/80 mt-1">
                Asisten Catat Tugas & Generator Reminder WhatsApp Kelas
              </p>
            </div>
          </div>

          {/* Actions & Counter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Active Subject Counter */}
            {isScheduleConfigured && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D1FAE5] border-2 border-[#141413] rounded-full shadow-[2px_2px_0px_#141413] font-mono text-xs font-extrabold rotate-1">
                <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{activeSubjectCount} MAPEL AKTIF</span>
              </div>
            )}

            {/* Cara Pakai Button */}
            <button
              type="button"
              onClick={onToggleHero}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold neo-btn-sm cursor-pointer ${
                isHeroVisible
                  ? "bg-[#DDD6FE] text-[#141413]"
                  : "bg-[#FFFDF9] hover:bg-[#DDD6FE] text-[#141413]"
              }`}
              title="Tampilkan atau sembunyikan panduan cara pakai"
            >
              <Lightbulb className="w-3.5 h-3.5 stroke-[2.4] text-[#FF5A36]" />
              <span>💡 Cara Pakai</span>
            </button>

            {/* Atur Jadwal Kelas Button */}
            <button
              type="button"
              onClick={onOpenScheduleModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C8F560] hover:bg-[#b8e84b] text-[#141413] font-bold text-xs neo-btn-sm cursor-pointer"
            >
              <CalendarCog className="w-4 h-4 stroke-[2.4]" />
              <span>Atur Jadwal Kelas</span>
            </button>

            {/* Reset Data Button */}
            {isScheduleConfigured && (
              <button
                type="button"
                onClick={onResetAllData}
                title="Reset / Kosongkan jadwal kelas di perangkat ini"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFFDF9] hover:bg-[#FF7A59] text-[#141413] font-bold text-xs neo-btn-sm cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.3]" />
                <span className="hidden md:inline">Reset / Kosongkan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
