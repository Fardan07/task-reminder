"use client";

import React, { useState, useMemo } from "react";
import {
  Bell,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { DayOfWeek, TaskItem, ReminderFormatStyle } from "@/types/task";
import { generateWhatsAppReminder } from "@/utils/reminderFormatter";

interface ReminderPreviewPanelProps {
  tasks: TaskItem[];
  selectedDayTab: string;
  onSelectDayTab: (day: DayOfWeek | "SEMUA") => void;
}

const DAY_TABS: { label: string; value: DayOfWeek | "SEMUA" }[] = [
  { label: "Senin", value: "Senin" },
  { label: "Selasa", value: "Selasa" },
  { label: "Rabu", value: "Rabu" },
  { label: "Kamis", value: "Kamis" },
  { label: "Jumat", value: "Jumat" },
  { label: "Semua", value: "SEMUA" },
];

export const ReminderPreviewPanel: React.FC<ReminderPreviewPanelProps> = ({
  tasks,
  selectedDayTab,
  onSelectDayTab,
}) => {
  const [copied, setCopied] = useState(false);
  const [formatStyle, setFormatStyle] = useState<ReminderFormatStyle>("standard");
  const [includeCompleted, setIncludeCompleted] = useState(false);

  // Filter tasks for the selected day tab
  const filteredTasks = useMemo(() => {
    if (selectedDayTab === "SEMUA") {
      return tasks;
    }
    return tasks.filter((t) => t.day === selectedDayTab);
  }, [tasks, selectedDayTab]);

  // Derive date string for header
  const activeDateString = useMemo(() => {
    if (selectedDayTab === "SEMUA") return "Semua Jadwal Pekan Ini";
    const found = filteredTasks.find((t) => t.dueDate);
    if (found) return found.dueDate;
    return `${selectedDayTab}, Pekan Berjalan`;
  }, [filteredTasks, selectedDayTab]);

  // Generate standardized text for WhatsApp
  const generatedText = useMemo(() => {
    return generateWhatsAppReminder(
      filteredTasks,
      selectedDayTab === "SEMUA" ? "PEKAN INI" : selectedDayTab,
      activeDateString,
      formatStyle,
      includeCompleted
    );
  }, [filteredTasks, selectedDayTab, activeDateString, formatStyle, includeCompleted]);

  // Copy to clipboard handler
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
      console.error("Failed to copy reminder text", err);
    }
  };

  // Open direct in WhatsApp
  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(generatedText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const activeTaskCount = filteredTasks.filter((t) => !t.isCompleted).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 text-gray-900 shadow-none flex flex-col h-full">
      {/* Header with Title & Day Tabs */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Bell className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                Preview Reminder WhatsApp
              </h2>
              <p className="text-xs text-gray-500">
                Teks otomatis siap salin untuk grup kelas XII SIJA 1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
              {activeTaskCount} Tugas Aktif
            </span>
          </div>
        </div>

        {/* Dynamic Day Selector Tabs */}
        <div>
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Pilih Hari Preview:</span>
            <span className="text-blue-600 font-semibold">{activeDateString}</span>
          </div>
          <div className="grid grid-cols-6 gap-1 bg-gray-100 p-1 rounded border border-gray-200">
            {DAY_TABS.map((tab) => {
              const isActive = selectedDayTab === tab.value;
              const count =
                tab.value === "SEMUA"
                  ? tasks.filter((t) => !t.isCompleted).length
                  : tasks.filter((t) => t.day === tab.value && !t.isCompleted)
                      .length;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onSelectDayTab(tab.value)}
                  className={`py-1.5 px-1 rounded text-xs font-semibold transition-colors duration-150 relative cursor-pointer text-center ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-none"
                      : "text-gray-700 hover:bg-gray-200 bg-transparent"
                  }`}
                >
                  <span className="truncate block">{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`inline-block text-[10px] px-1 rounded-full ${
                        isActive
                          ? "bg-white text-blue-700 font-bold"
                          : "bg-gray-300 text-gray-800"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Format Switcher & Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs bg-gray-50 p-2 rounded border border-gray-200">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600 font-medium">Format:</span>
          <button
            type="button"
            onClick={() => setFormatStyle("standard")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              formatStyle === "standard"
                ? "bg-blue-600 text-white font-semibold"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setFormatStyle("compact")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              formatStyle === "compact"
                ? "bg-blue-600 text-white font-semibold"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            Ringkas
          </button>
          <button
            type="button"
            onClick={() => setFormatStyle("formal")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              formatStyle === "formal"
                ? "bg-blue-600 text-white font-semibold"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            Formal
          </button>
        </div>

        <label className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeCompleted}
            onChange={(e) => setIncludeCompleted(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
          />
          <span>Sertakan tugas selesai</span>
        </label>
      </div>

      {/* Monospace Code Preview Box */}
      <div className="relative flex-1 flex flex-col min-h-[300px] mb-4">
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 text-gray-300 rounded-t text-xs font-mono border border-b-0 border-gray-700">
          <span className="flex items-center gap-1.5 text-gray-300">
            <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
            whatsapp_reminder_{selectedDayTab.toLowerCase()}.txt
          </span>
          <span className="text-[11px] text-gray-400">
            {generatedText.split("\n").length} baris • {generatedText.length}{" "}
            karakter
          </span>
        </div>

        <textarea
          readOnly
          value={generatedText}
          rows={14}
          className="w-full flex-1 p-3.5 bg-gray-900 text-gray-100 font-mono-preview text-xs leading-relaxed rounded-b border border-gray-700 focus:outline-none select-all overflow-y-auto resize-none"
        />

        {/* Floating Copied Badge when active */}
        {copied && (
          <div className="absolute top-10 right-4 bg-teal-500 text-white px-3 py-1 rounded text-xs font-bold shadow-none flex items-center gap-1.5 animate-in fade-in duration-150">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            Tersalin ke Clipboard!
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* Solid Teal Primary Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className={`w-full font-semibold px-4 py-2.5 rounded text-sm flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer shadow-none ${
            copied
              ? "bg-[#0F766E] text-white"
              : "bg-[#0D9488] hover:bg-[#0F766E] active:bg-[#115E59] text-white"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>✓ Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 stroke-[2.2]" />
              <span>[ 📋 Salin Reminder ]</span>
            </>
          )}
        </button>

        {/* WhatsApp Direct Share Button */}
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="w-full bg-white hover:bg-gray-100 active:bg-gray-200 border border-gray-300 text-gray-800 font-semibold px-4 py-2.5 rounded text-sm flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer shadow-none"
        >
          <Share2 className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
          <span>Buka di WhatsApp Web</span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </div>
  );
};
