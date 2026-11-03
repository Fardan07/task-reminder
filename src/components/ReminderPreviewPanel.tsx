"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Copy,
  Check,
  Send,
  MessageSquareText,
  Eye,
  FileText,
  Sparkles,
  BookmarkCheck,
} from "lucide-react";
import {
  DayOfWeek,
  ReminderTemplateStyle,
  SubjectDraft,
  WeeklyScheduleMap,
} from "@/types/task";
import {
  generateWhatsAppReminder,
  isSubjectDraftActiveForDay,
} from "@/utils/reminderFormatter";
import {
  formatDateUpperIndonesian,
  normalizeSubjectKey,
} from "@/data/mockData";

interface ReminderPreviewPanelProps {
  selectedDay: DayOfWeek;
  selectedIsoDate: string;
  schedule: WeeklyScheduleMap;
  drafts: Record<string, SubjectDraft>;
  classNameLabel?: string;
}

const STORAGE_STYLE_KEY = "sekrekita_reminder_style_v1";

/**
 * Parser inline markdown WhatsApp yang aman (bebas XSS):
 * Mendukung *tebal*, _miring_, ~coret~, dan URL panjang bergaris bawah.
 */
function parseWhatsAppInline(text: string): React.ReactNode[] {
  const regex = /(https?:\/\/[^\s]+)|\*([^*\n]+?)\*|_([^_\n]+?)|~([^~\n]+?)~/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const [fullMatch, urlMatch, boldMatch, italicMatch, strikeMatch] = match;
    const key = `${match.index}-${fullMatch}`;

    if (urlMatch) {
      nodes.push(
        <a
          key={key}
          href={urlMatch}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#53bdeb] hover:text-[#80d4ff] underline underline-offset-2 break-all font-mono text-xs"
        >
          {urlMatch}
        </a>
      );
    } else if (boldMatch !== undefined) {
      nodes.push(
        <strong key={key} className="font-extrabold text-[#FFFFFF]">
          {boldMatch}
        </strong>
      );
    } else if (italicMatch !== undefined) {
      nodes.push(
        <em key={key} className="italic text-[#E9EDEF]/85">
          {italicMatch}
        </em>
      );
    } else if (strikeMatch !== undefined) {
      nodes.push(
        <del key={key} className="line-through text-[#8696A0]">
          {strikeMatch}
        </del>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export const ReminderPreviewPanel: React.FC<ReminderPreviewPanelProps> = ({
  selectedDay,
  selectedIsoDate,
  schedule,
  drafts,
  classNameLabel = "KELAS KITA",
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"bubble" | "raw">("bubble");
  const [templateStyle, setTemplateStyle] = useState<ReminderTemplateStyle>(
    () => {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem(STORAGE_STYLE_KEY);
          if (saved === "MODERN" || saved === "KLASIK") {
            return saved;
          }
        } catch {
          // ignore
        }
      }
      return "KLASIK";
    }
  );

  // Sync template style to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STYLE_KEY, templateStyle);
    } catch {
      // ignore
    }
  }, [templateStyle]);

  const generatedText = useMemo(() => {
    return generateWhatsAppReminder(
      selectedDay,
      selectedIsoDate,
      schedule,
      drafts,
      templateStyle,
      classNameLabel
    );
  }, [selectedDay, selectedIsoDate, schedule, drafts, templateStyle, classNameLabel]);

  const daySubjects = schedule[selectedDay] || [];
  const activeTaskCount = daySubjects.filter((subj) =>
    isSubjectDraftActiveForDay(drafts[normalizeSubjectKey(subj)], selectedDay)
  ).length;
  const formattedDate = formatDateUpperIndonesian(selectedIsoDate);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = generatedText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error("Gagal menyalin teks reminder:", err);
    }
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(generatedText);
    window.open(
      `https://wa.me/?text=${encoded}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const lineCount = generatedText.split("\n").length;

  return (
    <div className="bg-[#18181B] text-[#FFFDF9] neo-card overflow-hidden flex flex-col relative">
      {/* Top Hazard Coral Strip */}
      <div className="h-2 w-full bg-hazard-coral border-b-2 border-[#141413]" />

      <div className="p-4 sm:p-5 flex flex-col">
        {/* Header Preview */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-dashed border-[#FFFDF9]/25">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#D1FAE5] border-2 border-[#141413] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#C8F560] shrink-0 rotate-2">
              <MessageSquareText className="w-5 h-5 text-[#141413] stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-[#FFFDF9]">
                  PREVIEW TEKS WHATSAPP
                </h2>
                <span className="text-[#C8F560] text-sm">✦</span>
              </div>
              <p className="font-mono text-xs font-bold text-[#D1FAE5]">
                {selectedDay}, {formattedDate}
              </p>
            </div>
          </div>

          <span className="font-mono text-xs font-extrabold bg-[#D1FAE5] text-[#141413] px-3 py-1 border-2 border-[#141413] rounded-full shadow-[2px_2px_0px_#FF5A36] -rotate-1">
            {activeTaskCount}/{daySubjects.length} MAPEL ISI
          </span>
        </div>

        {/* 2 PILIHAN GAYA TEMPLATE (KLASIK vs MODERN) */}
        <div className="bg-[#27272A] p-2.5 border-2 border-[#141413] rounded-xl mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-[#FFFDF9]/80">
            <span>Pilih Gaya Teks:</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
            {/* Tombol Gaya Klasik */}
            <button
              type="button"
              onClick={() => setTemplateStyle("KLASIK")}
              className={`px-3 py-1.5 text-xs font-extrabold uppercase rounded-lg border-2 border-[#141413] cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                templateStyle === "KLASIK"
                  ? "bg-[#C8F560] text-[#141413] shadow-[2px_2px_0px_#141413]"
                  : "bg-[#18181B] text-[#FFFDF9]/75 hover:bg-[#3F3F46]"
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Gaya Klasik</span>
            </button>

            {/* Tombol Gaya Modern */}
            <button
              type="button"
              onClick={() => setTemplateStyle("MODERN")}
              className={`px-3 py-1.5 text-xs font-extrabold uppercase rounded-lg border-2 border-[#141413] cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                templateStyle === "MODERN"
                  ? "bg-[#FF5A36] text-[#FFFDF9] shadow-[2px_2px_0px_#141413]"
                  : "bg-[#18181B] text-[#FFFDF9]/75 hover:bg-[#3F3F46]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Gaya Modern</span>
            </button>
          </div>
        </div>

        {/* BAR KONTROL KOTAK PREVIEW: BUBBLE WA vs TEKS MENTAH (RAW) */}
        <div className="bg-[#141413] text-[#FFFDF9] px-3 py-2 border-2 border-[#141413] rounded-t-xl flex flex-wrap items-center justify-between gap-2">
          {/* Toggle Bubble vs Raw */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("bubble")}
              className={`px-2.5 py-1 text-[11px] font-extrabold uppercase rounded border cursor-pointer transition-all flex items-center gap-1.5 ${
                viewMode === "bubble"
                  ? "bg-[#C8F560] text-[#141413] border-[#141413] font-black"
                  : "bg-[#27272A] text-[#FFFDF9]/80 border-transparent hover:bg-[#3F3F46]"
              }`}
            >
              <Eye className="w-3.5 h-3.5 stroke-[2.6]" />
              <span>Preview Bubble WA</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("raw")}
              className={`px-2.5 py-1 text-[11px] font-extrabold uppercase rounded border cursor-pointer transition-all flex items-center gap-1.5 ${
                viewMode === "raw"
                  ? "bg-[#C8F560] text-[#141413] border-[#141413] font-black"
                  : "bg-[#27272A] text-[#FFFDF9]/80 border-transparent hover:bg-[#3F3F46]"
              }`}
            >
              <FileText className="w-3.5 h-3.5 stroke-[2.6]" />
              <span>Teks Mentah (Raw)</span>
            </button>
          </div>

          <span className="font-mono text-[11px] font-extrabold text-[#C8F560]">
            {lineCount} BARIS
          </span>
        </div>

        {/* CONTAINER KOTAK PREVIEW */}
        <div className="relative mb-4">
          {viewMode === "bubble" ? (
            /* 1. TAMPILAN BUBBLE CHAT WHATSAPP */
            <div className="w-full bg-[#0B141A] p-3 sm:p-4 border-2 border-t-0 border-[#141413] rounded-b-xl shadow-[3px_3px_0px_#000000] min-h-[360px] max-h-[460px] overflow-y-auto relative">
              {/* Wallpaper Pattern Subtle Watermark */}
              <div
                className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"
                aria-hidden="true"
              />

              {/* Gelembung Pesan Terkirim WhatsApp (Outgoing Green Bubble) */}
              <div className="relative z-10 max-w-[95%] sm:max-w-[92%] ml-auto bg-[#005C4B] text-[#E9EDEF] border border-[#141413] rounded-2xl rounded-tr-sm p-3.5 sm:p-4 shadow-[2px_2px_0px_#141413]">
                {/* Isi Pesan dengan Render Markdown WhatsApp Otomatis */}
                <div className="font-sans text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words select-text space-y-1">
                  {generatedText.split("\n").map((line, idx) => (
                    <div key={idx} className="min-h-[1.25em]">
                      {parseWhatsAppInline(line)}
                    </div>
                  ))}
                </div>

                {/* Footer Timestamp & Centang Dua Biru Khas WhatsApp */}
                <div className="flex items-center justify-end gap-1 mt-2 pt-1 font-mono text-[10px] text-[#8696A0]">
                  <span>11:15</span>
                  <span
                    className="text-[#53bdeb] font-extrabold tracking-tighter"
                    title="Terkirim & Dibaca"
                  >
                    ✓✓
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* 2. TAMPILAN TEKS MENTAH (RAW MONOSPACE TEXTAREA) */
            <textarea
              readOnly
              value={generatedText}
              rows={15}
              aria-label="Preview teks mentah WhatsApp"
              className="w-full p-3.5 bg-[#FFFDF9] text-[#141413] font-mono-preview text-xs sm:text-sm font-bold border-2 border-t-0 border-[#141413] rounded-b-xl shadow-[3px_3px_0px_#000000] focus:outline-none select-all resize-y"
            />
          )}

          {/* Floating 'Tersalin!' Feedback */}
          {copied && (
            <div className="absolute top-3 right-4 z-20 bg-[#C8F560] text-[#141413] border-2 border-[#141413] px-3 py-1 rounded-full shadow-[2px_2px_0px_#141413] font-mono text-xs font-extrabold flex items-center gap-1.5 -rotate-2">
              <Check className="w-4 h-4 stroke-[2.8]" />
              <span>Tersalin!</span>
            </div>
          )}
        </div>

        {/* TOMBOL CTA UTAMA (TANGERINE CORAL #FF5A36) & KIRIM WA */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className={`w-full py-3.5 px-4 text-sm sm:text-base font-extrabold uppercase tracking-tight border-2 border-[#141413] rounded-xl shadow-[4px_4px_0px_#C8F560] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#C8F560] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 ${
              copied
                ? "bg-[#C8F560] text-[#141413]"
                : "bg-[#FF5A36] hover:bg-[#ff6b4a] text-[#FFFDF9]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 stroke-[2.6]" />
                <span>Salin Teks ke WhatsApp</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full py-3 px-4 bg-[#D1FAE5] hover:bg-[#C8F560] text-[#141413] text-xs sm:text-sm font-extrabold uppercase tracking-tight border-2 border-[#141413] rounded-xl shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span>Kirim ke WhatsApp (wa.me)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
