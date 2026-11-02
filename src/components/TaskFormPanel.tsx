"use client";

import React, { useState } from "react";
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Link as LinkIcon,
  RotateCcw,
  Repeat,
} from "lucide-react";
import {
  DayOfWeek,
  SubjectDraft,
  TaskLinkItem,
  TaskPointItem,
  WeeklyScheduleMap,
} from "@/types/task";
import {
  DAYS_OF_WEEK,
  formatDateUpperIndonesian,
  getDaysForSubject,
  normalizeSubjectKey,
} from "@/data/mockData";
import { isSubjectDraftActiveForDay } from "@/utils/reminderFormatter";

interface TaskFormPanelProps {
  selectedDay: DayOfWeek;
  selectedIsoDate: string;
  smartTomorrowDay: DayOfWeek;
  smartTomorrowIsoDate: string;
  schedule: WeeklyScheduleMap;
  drafts: Record<string, SubjectDraft>;
  onSelectDay: (day: DayOfWeek) => void;
  onChangeIsoDate: (isoDate: string) => void;
  onJumpToTomorrow: () => void;
  onUpdateSubjectDraft: (subjectName: string, draft: SubjectDraft) => void;
  onClearSubjectDraft: (subjectName: string) => void;
  onClearAllDaySubjects: (day: DayOfWeek) => void;
  onOpenScheduleModal?: () => void;
}

const SUBJECT_ACCENT_PALETTE = [
  {
    bg: "bg-[#C8F560]",
    ribbon: "bg-[#C8F560]",
  },
  {
    bg: "bg-[#FF7A59]",
    ribbon: "bg-[#FF7A59]",
  },
  {
    bg: "bg-[#C4B5FD]",
    ribbon: "bg-[#C4B5FD]",
  },
  {
    bg: "bg-[#7DD3FC]",
    ribbon: "bg-[#7DD3FC]",
  },
];

export const TaskFormPanel: React.FC<TaskFormPanelProps> = ({
  selectedDay,
  selectedIsoDate,
  smartTomorrowDay,
  smartTomorrowIsoDate,
  schedule,
  drafts,
  onSelectDay,
  onChangeIsoDate,
  onJumpToTomorrow,
  onUpdateSubjectDraft,
  onClearSubjectDraft,
  onClearAllDaySubjects,
  onOpenScheduleModal,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [openLinkKeys, setOpenLinkKeys] = useState<Record<string, boolean>>({});

  const daySubjects = schedule[selectedDay] || [];
  const formattedDate = formatDateUpperIndonesian(selectedIsoDate);
  const isShowingSmartTomorrow =
    selectedDay === smartTomorrowDay && selectedIsoDate === smartTomorrowIsoDate;

  const toggleExpandSubject = (subjectName: string) => {
    const key = normalizeSubjectKey(subjectName);
    const existing = drafts[key];
    const isActive = isSubjectDraftActiveForDay(existing, selectedDay);

    if (!isActive && !expandedKeys[key]) {
      const hasExistingContent =
        existing &&
        (existing.points.some((p) => p.text.trim().length > 0) ||
          existing.links.some((l) => l.url.trim().length > 0));

      if (hasExistingContent && existing) {
        onUpdateSubjectDraft(subjectName, {
          ...existing,
          targetDay: "ALL",
          updatedAt: new Date().toISOString(),
        });
      } else {
        const initialDraft: SubjectDraft = {
          subjectKey: key,
          subjectName,
          points: [{ id: `pt-${Date.now()}`, text: "" }],
          links: [],
          targetDay: "ALL",
          updatedAt: new Date().toISOString(),
        };
        onUpdateSubjectDraft(subjectName, initialDraft);
      }
      setExpandedKeys((prev) => ({ ...prev, [key]: true }));
    } else {
      setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handlePointChange = (
    subjectName: string,
    pointId: string,
    newText: string
  ) => {
    const key = normalizeSubjectKey(subjectName);
    const current = drafts[key] || {
      subjectKey: key,
      subjectName,
      points: [],
      links: [],
      targetDay: "ALL",
      updatedAt: new Date().toISOString(),
    };

    const updatedPoints = current.points.map((p) =>
      p.id === pointId ? { ...p, text: newText } : p
    );

    setExpandedKeys((prev) => ({ ...prev, [key]: true }));
    onUpdateSubjectDraft(subjectName, {
      ...current,
      subjectName,
      points: updatedPoints,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddPoint = (subjectName: string) => {
    const key = normalizeSubjectKey(subjectName);
    const current = drafts[key] || {
      subjectKey: key,
      subjectName,
      points: [],
      links: [],
      targetDay: "ALL",
      updatedAt: new Date().toISOString(),
    };

    const newPoint: TaskPointItem = {
      id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: "",
    };

    onUpdateSubjectDraft(subjectName, {
      ...current,
      subjectName,
      points: [...current.points, newPoint],
      updatedAt: new Date().toISOString(),
    });
    setExpandedKeys((prev) => ({ ...prev, [key]: true }));
  };

  const handleRemovePoint = (subjectName: string, pointId: string) => {
    const key = normalizeSubjectKey(subjectName);
    const current = drafts[key];
    if (!current) return;

    const filteredPoints = current.points.filter((p) => p.id !== pointId);
    const updatedPoints =
      filteredPoints.length === 0 && current.links.length === 0
        ? [{ id: `pt-${Date.now()}`, text: "" }]
        : filteredPoints;

    setExpandedKeys((prev) => ({ ...prev, [key]: true }));
    onUpdateSubjectDraft(subjectName, {
      ...current,
      points: updatedPoints,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddLink = (subjectName: string) => {
    const key = normalizeSubjectKey(subjectName);
    const current = drafts[key] || {
      subjectKey: key,
      subjectName,
      points: [],
      links: [],
      targetDay: "ALL",
      updatedAt: new Date().toISOString(),
    };

    const newLink: TaskLinkItem = {
      id: `lnk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: "Link Notion",
      url: "",
    };

    onUpdateSubjectDraft(subjectName, {
      ...current,
      subjectName,
      links: [...current.links, newLink],
      updatedAt: new Date().toISOString(),
    });
    setOpenLinkKeys((prev) => ({ ...prev, [key]: true }));
    setExpandedKeys((prev) => ({ ...prev, [key]: true }));
  };

  const handleLinkChange = (
    subjectName: string,
    linkId: string,
    field: "label" | "url",
    value: string
  ) => {
    const key = normalizeSubjectKey(subjectName);
    const current = drafts[key];
    if (!current) return;

    const updatedLinks = current.links.map((l) =>
      l.id === linkId ? { ...l, [field]: value } : l
    );

    setExpandedKeys((prev) => ({ ...prev, [key]: true }));
    onUpdateSubjectDraft(subjectName, {
      ...current,
      links: updatedLinks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRemoveLink = (subjectName: string, linkId: string) => {
    const key = normalizeSubjectKey(subjectName);
    const current = drafts[key];
    if (!current) return;

    const updatedLinks = current.links.filter((l) => l.id !== linkId);
    setExpandedKeys((prev) => ({ ...prev, [key]: true }));
    onUpdateSubjectDraft(subjectName, {
      ...current,
      links: updatedLinks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleTargetDayChange = (
    subjectName: string,
    targetDay: DayOfWeek | "ALL"
  ) => {
    const key = normalizeSubjectKey(subjectName);
    const current = drafts[key];
    if (!current) return;

    setExpandedKeys((prev) => ({ ...prev, [key]: true }));
    onUpdateSubjectDraft(subjectName, {
      ...current,
      targetDay,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleClearSingleSubject = (subjectName: string) => {
    const key = normalizeSubjectKey(subjectName);
    onClearSubjectDraft(subjectName);
    setExpandedKeys((prev) => ({ ...prev, [key]: false }));
    setOpenLinkKeys((prev) => ({ ...prev, [key]: false }));
  };

  const handleClearAllForSelectedDay = () => {
    const nextExpanded = { ...expandedKeys };
    const nextLinks = { ...openLinkKeys };
    daySubjects.forEach((subj) => {
      const k = normalizeSubjectKey(subj);
      nextExpanded[k] = false;
      nextLinks[k] = false;
    });
    setExpandedKeys(nextExpanded);
    setOpenLinkKeys(nextLinks);
    onClearAllDaySubjects(selectedDay);
  };

  const activeCountToday = daySubjects.filter((subj) => {
    const key = normalizeSubjectKey(subj);
    return isSubjectDraftActiveForDay(drafts[key], selectedDay);
  }).length;

  return (
    <div className="space-y-6">
      {/* 1. KARTU TARGET HARI (FESTIVAL TICKET CUTOUT + ACID LIME #C8F560) */}
      <div className="bg-[#C8F560] neo-card relative overflow-hidden">
        {/* Decorative Corner Starburst SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-24 h-24 text-[#141413]/10 absolute -top-4 -right-4 pointer-events-none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M50 0 L61 35 L96 25 L71 50 L96 75 L61 65 L50 100 L39 65 L4 75 L29 50 L4 25 L39 35 Z" />
        </svg>

        {/* Top Section of Ticket */}
        <div className="p-4 sm:p-5 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              {/* Tilted Physical Sticker Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141413] text-[#FFFDF9] border-2 border-[#141413] rounded-full text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_#FF5A36] mb-2.5 -rotate-1">
                <span className="text-[#C8F560]">✦</span>
                <span>
                  {isShowingSmartTomorrow
                    ? "OTOMATIS: JADWAL HARI BESOK"
                    : `MODE CEK JADWAL HARI ${selectedDay}`}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#141413]">
                TARGET HARI: {selectedDay}
              </h2>

              <div className="inline-flex items-center gap-2 mt-1.5 px-2.5 py-0.5 bg-[#FFFDF9] border-2 border-[#141413] rounded-md shadow-[2px_2px_0px_#141413]">
                <span className="font-mono text-xs sm:text-sm font-extrabold text-[#141413]">
                  {formattedDate}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isShowingSmartTomorrow && (
                <button
                  type="button"
                  onClick={onJumpToTomorrow}
                  className="bg-[#DDD6FE] hover:bg-[#C4B5FD] text-[#141413] font-bold text-xs px-3 py-2 neo-btn-sm cursor-pointer flex items-center gap-1.5 rotate-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2.4]" />
                  <span>Ke Besok ({smartTomorrowDay})</span>
                </button>
              )}

              {/* Pemilih Tanggal */}
              <div className="flex items-center gap-1.5 bg-[#FFFDF9] border-2 border-[#141413] rounded-lg px-3 py-1.5 shadow-[3px_3px_0px_#141413]">
                <Calendar className="w-4 h-4 text-[#FF5A36] stroke-[2.5] shrink-0" />
                <input
                  type="date"
                  value={selectedIsoDate}
                  onChange={(e) => onChangeIsoDate(e.target.value)}
                  aria-label="Pilih tanggal reminder"
                  className="font-mono text-xs font-extrabold text-[#141413] bg-transparent focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TICKET PERFORATION DIVIDER WITH LEFT & RIGHT PUNCH NOTCHES */}
        <div className="relative flex items-center justify-between my-0.5">
          <div
            className="w-6 h-6 rounded-full bg-[#F3EFE6] border-2 border-[#141413] -ml-3.5 shrink-0 z-10"
            aria-hidden="true"
          />
          <div className="w-full border-t-2 border-dashed border-[#141413] mx-1" />
          <div
            className="w-6 h-6 rounded-full bg-[#F3EFE6] border-2 border-[#141413] -mr-3.5 shrink-0 z-10"
            aria-hidden="true"
          />
        </div>

        {/* Bottom Section of Ticket: Day Tabs */}
        <div className="p-4 sm:p-5 pt-3.5 relative z-10">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase mb-2.5">
            <span>PILIH HARI PELAJARAN:</span>
            <span className="font-mono bg-[#141413] text-[#C8F560] px-2.5 py-0.5 border-2 border-[#141413] rounded-full text-[11px] font-bold">
              {activeCountToday}/{daySubjects.length} MAPEL ISI
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = day === selectedDay;
              const isTomorrow = day === smartTomorrowDay;
              const subjectsOfDay = schedule[day] || [];
              const activeInDay = subjectsOfDay.filter((s) =>
                isSubjectDraftActiveForDay(
                  drafts[normalizeSubjectKey(s)],
                  day
                )
              ).length;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => onSelectDay(day)}
                  className={`py-2.5 px-1 sm:px-2 neo-btn-sm cursor-pointer text-center relative ${
                    isSelected
                      ? "bg-[#141413] text-[#C8F560]"
                      : "bg-[#FFFDF9] hover:bg-[#DDD6FE] text-[#141413]"
                  }`}
                >
                  {isTomorrow && (
                    <span
                      className={`inline-block text-[9px] font-mono uppercase font-extrabold px-1.5 rounded-full mb-0.5 ${
                        isSelected
                          ? "bg-[#FF5A36] text-[#FFFDF9]"
                          : "bg-[#C8F560] text-[#141413] border border-[#141413]"
                      }`}
                    >
                      ✦ BESOK
                    </span>
                  )}
                  <div className="text-xs sm:text-sm font-extrabold uppercase tracking-tight">
                    {day}
                  </div>
                  <div
                    className={`font-mono text-[10px] font-bold mt-0.5 ${
                      isSelected ? "text-[#FFFDF9]/90" : "text-[#141413]/70"
                    }`}
                  >
                    {activeInDay > 0
                      ? `${activeInDay} tugas`
                      : `${subjectsOfDay.length} mapel`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. KARTU DAFTAR MAPEL INTERAKTIF (WARM STUDIO WHITE #FFFDF9 + MULTI-ACCENT TAGS) */}
      <div className="bg-[#FFFDF9] neo-card overflow-hidden">
        {/* Top Checkerboard Bar */}
        <div className="h-2.5 w-full bg-checkerboard border-b-2 border-[#141413]" />

        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b-2 border-[#141413]">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-[#141413]">
                DAFTAR MAPEL HARI {selectedDay}
              </h3>
              <p className="text-xs font-medium text-[#141413]/80 mt-0.5">
                Klik <span className="font-bold underline decoration-[#FF5A36]">+ Tambah Tugas</span> untuk mengisi poin tugas, atau{" "}
                <span className="font-bold">Selesai / Kosongkan</span> jika sudah lewat.
              </p>
            </div>

            {/* Decorative Zig-Zag SVG + Clear Day Action */}
            <div className="flex items-center gap-3">
              <svg
                width="48"
                height="12"
                viewBox="0 0 48 12"
                fill="none"
                className="hidden sm:block text-[#141413]"
                aria-hidden="true"
              >
                <polyline
                  points="0,10 6,2 12,10 18,2 24,10 30,2 36,10 42,2 48,10"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {activeCountToday > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllForSelectedDay}
                  className="bg-[#FFFDF9] hover:bg-[#FF7A59] text-[#141413] font-bold text-xs px-3 py-1.5 neo-btn-sm cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2.4]" />
                  <span>Kosongkan Hari {selectedDay}</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3.5">
            {daySubjects.length === 0 ? (
              <div className="p-6 text-center bg-[#F3EFE6] border-2 border-dashed border-[#141413] rounded-xl space-y-2.5">
                <p className="text-xs sm:text-sm font-extrabold text-[#141413]">
                  Belum ada jadwal mata pelajaran di hari {selectedDay}.
                </p>
                {onOpenScheduleModal && (
                  <button
                    type="button"
                    onClick={onOpenScheduleModal}
                    className="px-4 py-2 bg-[#C8F560] hover:bg-[#b8e84b] text-[#141413] text-xs font-extrabold uppercase neo-btn-sm cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.6]" />
                    <span>Tambah Mapel Hari {selectedDay}</span>
                  </button>
                )}
              </div>
            ) : (
              daySubjects.map((subjectName, index) => {
                const key = normalizeSubjectKey(subjectName);
                const draft = drafts[key];
                const isActive = isSubjectDraftActiveForDay(draft, selectedDay);
                const isExpanded = isActive || !!expandedKeys[key];
                const subjectDays = getDaysForSubject(subjectName, schedule);
                const isMultiDaySubject = subjectDays.length > 1;
                const hasTaskInOtherDay =
                  !isActive &&
                  draft &&
                  draft.targetDay !== "ALL" &&
                  draft.targetDay !== selectedDay &&
                  (draft.points.some((p) => p.text.trim().length > 0) ||
                    draft.links.some((l) => l.url.trim().length > 0));
                const accent =
                  SUBJECT_ACCENT_PALETTE[index % SUBJECT_ACCENT_PALETTE.length];

                const points = draft?.points || [];
                const links = draft?.links || [];

                return (
                  <div
                    key={`${selectedDay}-${subjectName}-${index}`}
                    className={`neo-card-sm overflow-hidden transition-colors relative ${
                      isExpanded ? "bg-[#FFFDF9]" : "bg-[#F3EFE6]/60"
                    }`}
                  >
                    {/* Left Color Accent Ribbon Bar */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-2.5 border-r-2 border-[#141413] ${accent.ribbon}`}
                      aria-hidden="true"
                    />

                    <div className="pl-5 pr-3.5 py-3.5 sm:pr-4 sm:py-4">
                      {/* Header Kartu Mapel */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-8 h-8 ${accent.bg} border-2 border-[#141413] rounded-lg font-mono text-xs font-extrabold flex items-center justify-center shadow-[2px_2px_0px_#141413] shrink-0 -rotate-2`}
                          >
                            0{index + 1}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-[#141413]">
                                {subjectName}
                              </h4>
                              {isMultiDaySubject && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#DDD6FE] border-2 border-[#141413] rounded-full text-[10px] font-mono font-bold text-[#141413]">
                                  <Repeat className="w-2.5 h-2.5 stroke-[2.5]" />
                                  {subjectDays.join(" • ")}
                                </span>
                              )}
                            </div>

                            {/* Status jika belum ada tugas */}
                            {!isExpanded && (
                              <p className="font-mono text-xs font-bold text-[#141413]/60 mt-0.5">
                                {hasTaskInOtherDay
                                  ? `Tidak ada tugas hari ini (- -) • Aktif di hari ${draft?.targetDay}`
                                  : "Tidak ada tugas (- -)"}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Tombol Aksi Cepat di Kanan Kartu */}
                        <div className="flex items-center gap-2">
                          {!isExpanded ? (
                            <button
                              type="button"
                              onClick={() => toggleExpandSubject(subjectName)}
                              className={`${accent.bg} hover:opacity-90 text-[#141413] font-extrabold text-xs px-3.5 py-1.5 neo-btn-sm cursor-pointer flex items-center gap-1`}
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
                              <span>Tambah Tugas</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleClearSingleSubject(subjectName)
                              }
                              className="bg-[#F3EFE6] hover:bg-[#FF7A59] text-[#141413] font-bold text-xs px-3 py-1.5 neo-btn-sm cursor-pointer flex items-center gap-1.5"
                              title="Reset mapel ini kembali menjadi - -"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.4]" />
                              <span>Selesai / Kosongkan</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Form Input Inline Cepat */}
                      {isExpanded && (
                        <div className="mt-3.5 pt-3 border-t-2 border-dashed border-[#141413] space-y-3">
                          {/* Opsi Pertemuan Berikutnya jika mapel muncul di >1 hari */}
                          {isMultiDaySubject && draft && (
                            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F3EFE6] border-2 border-[#141413] rounded-lg px-3 py-2 text-xs">
                              <span className="font-bold text-[#141413]">
                                Tampilkan tugas{" "}
                                <span className="font-extrabold">
                                  {subjectName}
                                </span>{" "}
                                di:
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTargetDayChange(subjectName, "ALL")
                                  }
                                  className={`px-2.5 py-1 rounded-full border-2 border-[#141413] font-bold text-[11px] cursor-pointer ${
                                    draft.targetDay === "ALL"
                                      ? "bg-[#C8F560] text-[#141413] shadow-[2px_2px_0px_#141413]"
                                      : "bg-[#FFFDF9] text-[#141413]/70"
                                  }`}
                                >
                                  Semua Pertemuan ({subjectDays.join("/")})
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTargetDayChange(
                                      subjectName,
                                      selectedDay
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded-full border-2 border-[#141413] font-bold text-[11px] cursor-pointer ${
                                    draft.targetDay === selectedDay
                                      ? "bg-[#C8F560] text-[#141413] shadow-[2px_2px_0px_#141413]"
                                      : "bg-[#FFFDF9] text-[#141413]/70"
                                  }`}
                                >
                                  Hanya {selectedDay}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Daftar Input Poin Tugas */}
                          <div className="space-y-2">
                            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                              POIN TUGAS ({points.length}):
                            </label>

                            {points.map((pt, ptIdx) => (
                              <div key={pt.id} className="flex items-start gap-2">
                                <span
                                  className={`font-mono text-xs font-extrabold ${accent.bg} border-2 border-[#141413] rounded-md px-2 py-2 shrink-0`}
                                >
                                  • -
                                </span>
                                <input
                                  type="text"
                                  value={pt.text}
                                  onChange={(e) =>
                                    handlePointChange(
                                      subjectName,
                                      pt.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Ketik poin tugas ke-${ptIdx + 1} untuk ${subjectName}...`}
                                  className="flex-1 neo-input px-3 py-2 text-xs sm:text-sm font-semibold"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemovePoint(subjectName, pt.id)
                                  }
                                  className="p-2 bg-[#F3EFE6] hover:bg-[#FF7A59] border-2 border-[#141413] rounded-lg text-[#141413] cursor-pointer shrink-0"
                                  title="Hapus poin ini"
                                >
                                  <Trash2 className="w-4 h-4 stroke-[2.2]" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Daftar Input Link Opsional (Misal: Link Notion) */}
                          {(links.length > 0 || openLinkKeys[key]) && (
                            <div className="space-y-2 pt-1">
                              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                                SISIPAN LINK OPSIONAL (NOTION / GDRIVE / LMS):
                              </label>
                              {links.map((lnk) => (
                                <div
                                  key={lnk.id}
                                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#F3EFE6] p-2 border-2 border-[#141413] rounded-lg"
                                >
                                  <input
                                    type="text"
                                    value={lnk.label}
                                    onChange={(e) =>
                                      handleLinkChange(
                                        subjectName,
                                        lnk.id,
                                        "label",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Label (cth: Link Notion)"
                                    className="sm:w-36 neo-input px-2.5 py-1.5 text-xs font-bold"
                                  />
                                  <input
                                    type="text"
                                    inputMode="url"
                                    value={lnk.url}
                                    onChange={(e) =>
                                      handleLinkChange(
                                        subjectName,
                                        lnk.id,
                                        "url",
                                        e.target.value
                                      )
                                    }
                                    placeholder="https://..."
                                    className="flex-1 neo-input px-2.5 py-1.5 font-mono text-xs font-medium"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveLink(subjectName, lnk.id)
                                    }
                                    className="p-1.5 bg-[#FFFDF9] hover:bg-[#FF7A59] border-2 border-[#141413] rounded text-[#141413] cursor-pointer self-end sm:self-auto"
                                    title="Hapus link"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Tombol Tambah Poin & Tambah Link */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleAddPoint(subjectName)}
                              className="bg-[#C8F560] hover:bg-[#b8e84b] text-[#141413] font-bold text-xs px-3 py-1.5 neo-btn-sm cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.6]" />
                              <span>Tambah Poin Tugas</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAddLink(subjectName)}
                              className="bg-[#DDD6FE] hover:bg-[#C4B5FD] text-[#141413] font-bold text-xs px-3 py-1.5 neo-btn-sm cursor-pointer flex items-center gap-1.5"
                            >
                              <LinkIcon className="w-3.5 h-3.5 stroke-[2.4]" />
                              <span>+ Sisipkan Link (Notion/URL)</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
