"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Send, MessageSquareText } from "lucide-react";
import { DayOfWeek, SubjectDraft, WeeklyScheduleMap } from "@/types/task";
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
}

export const ReminderPreviewPanel: React.FC<ReminderPreviewPanelProps> = ({
  selectedDay,
  selectedIsoDate,
  schedule,
  drafts,
}) => {
  const [copied, setCopied] = useState(false);

  const generatedText = useMemo(() => {
    return generateWhatsAppReminder(
      selectedDay,
      selectedIsoDate,
      schedule,
      drafts
    );
  }, [selectedDay, selectedIsoDate, schedule, drafts]);

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

  return (
    <div className="bg-[#18181B] text-[#FFFDF9] neo-card overflow-hidden flex flex-col relative">
      {/* Top Hazard Coral Strip */}
      <div className="h-2 w-full bg-hazard-coral border-b-2 border-[#141413]" />

      <div className="p-4 sm:p-5 flex flex-col">
        {/* Header Preview */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-3.5 border-b-2 border-dashed border-[#FFFDF9]/25">
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
                {selectedDay} {"//"} {formattedDate}
              </p>
            </div>
          </div>

          <span className="font-mono text-xs font-extrabold bg-[#D1FAE5] text-[#141413] px-3 py-1 border-2 border-[#141413] rounded-full shadow-[2px_2px_0px_#FF5A36] -rotate-1">
            {activeTaskCount}/{daySubjects.length} MAPEL ISI
          </span>
        </div>

        {/* Kotak Preview Teks Monospace (Soft Sage Frame + Studio Paper Screen) */}
        <div className="relative mb-4 bg-[#D1FAE5] p-2.5 border-2 border-[#141413] rounded-xl shadow-[3px_3px_0px_#000000]">
          <div className="bg-[#141413] text-[#FFFDF9] px-3 py-1.5 rounded-t-lg flex items-center justify-between font-mono text-[11px] font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C8F560] inline-block" />
              <span>TX-WA // SIAP KIRIM GRUP</span>
            </span>
            <span className="text-[#C8F560]">
              [{generatedText.split("\n").length} BARIS]
            </span>
          </div>

          <textarea
            readOnly
            value={generatedText}
            rows={15}
            aria-label="Preview teks WhatsApp"
            className="w-full p-3.5 bg-[#FFFDF9] text-[#141413] font-mono-preview text-xs sm:text-sm font-bold border-2 border-t-0 border-[#141413] rounded-b-lg focus:outline-none select-all resize-y"
          />

          {copied && (
            <div className="absolute top-11 right-5 bg-[#C8F560] text-[#141413] border-2 border-[#141413] px-3 py-1 rounded-full shadow-[2px_2px_0px_#141413] font-mono text-xs font-extrabold flex items-center gap-1.5 -rotate-2">
              <Check className="w-4 h-4 stroke-[2.8]" />
              <span>Tersalin!</span>
            </div>
          )}
        </div>

        {/* Tombol CTA Utama (Tangerine Coral #FF5A36) & Kirim WA */}
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
