"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Save,
  CalendarCog,
  Copy,
  Check,
  Share2,
  Download,
  Sparkles,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { ClassConfig, DayOfWeek, WeeklyScheduleMap } from "@/types/task";
import {
  COMMON_SCHOOL_SUBJECTS,
  DAYS_OF_WEEK,
  DEFAULT_CLASS_CONFIG,
  DEFAULT_SIJA_CUSTOM_SUBJECTS,
  GENERAL_SMA_CLASS_CONFIG,
  decodeScheduleBackup,
  encodeScheduleBackup,
  normalizeSubjectKey,
} from "@/data/mockData";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  classConfig: ClassConfig;
  customSubjects: string[];
  focusBackupOnOpen?: boolean;
  startEmptyMode?: boolean;
  onSaveConfig: (
    newConfig: ClassConfig,
    updatedCustomSubjects: string[],
    isSijaPreset?: boolean
  ) => void;
}

const DAY_CARD_COLORS: Record<DayOfWeek, string> = {
  SENIN: "bg-[#C8F560]",
  SELASA: "bg-[#FF7A59]",
  RABU: "bg-[#C4B5FD]",
  KAMIS: "bg-[#7DD3FC]",
  JUMAT: "bg-[#D1FAE5]",
};

const CUSTOM_OPTION_VALUE = "__CUSTOM_INPUT__";

function buildInitialScheduleForModal(
  classConfig: ClassConfig,
  startEmptyMode: boolean
): WeeklyScheduleMap {
  const isCurrentlyEmpty = DAYS_OF_WEEK.every(
    (d) => (classConfig.schedule[d] || []).length === 0
  );
  if (startEmptyMode || isCurrentlyEmpty) {
    // Sediakan slot kosong yang siap dipilih oleh pengguna baru
    return {
      SENIN: ["", "", "", ""],
      SELASA: ["", "", "", ""],
      RABU: ["", "", "", ""],
      KAMIS: ["", "", "", ""],
      JUMAT: ["", ""],
    };
  }
  return classConfig.schedule;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  classConfig,
  customSubjects,
  focusBackupOnOpen = false,
  startEmptyMode = false,
  onSaveConfig,
}) => {
  const backupSectionRef = useRef<HTMLDivElement | null>(null);
  const classNameInputRef = useRef<HTMLInputElement | null>(null);

  const [className, setClassName] = useState(
    startEmptyMode ? "" : classConfig.className
  );
  const [schedule, setSchedule] = useState<WeeklyScheduleMap>(() =>
    buildInitialScheduleForModal(classConfig, startEmptyMode)
  );
  const [localCustomSubjects, setLocalCustomSubjects] =
    useState<string[]>(customSubjects);
  const [selectedPresetTag, setSelectedPresetTag] = useState<string | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);

  // Track which specific row (e.g. "SENIN-2") is currently in inline custom text input mode
  const [customInputRows, setCustomInputRows] = useState<
    Record<string, string>
  >({});

  // Backup & Restore states
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [restoreCodeInput, setRestoreCodeInput] = useState("");
  const [restoreFeedback, setRestoreFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Combine all subjects currently in schedule + customSubjects so no existing subject is missing from dropdown
  const allCustomAndScheduleSubjects = useMemo(() => {
    const set = new Set<string>(localCustomSubjects);
    DAYS_OF_WEEK.forEach((day) => {
      (schedule[day] || []).forEach((subj) => {
        const trimmed = subj.trim();
        if (trimmed && !COMMON_SCHOOL_SUBJECTS.includes(trimmed)) {
          set.add(trimmed);
        }
      });
    });
    return Array.from(set);
  }, [localCustomSubjects, schedule]);

  useEffect(() => {
    if (isOpen && focusBackupOnOpen && backupSectionRef.current) {
      backupSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else if (isOpen && startEmptyMode && classNameInputRef.current) {
      classNameInputRef.current.focus();
    }
  }, [isOpen, focusBackupOnOpen, startEmptyMode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolveCanonicalSubjectName = (
    rawInput: string,
    currentCustomList: string[]
  ): { canonicalName: string; isNewCustom: boolean } => {
    const trimmed = rawInput.trim();
    const inputKey = normalizeSubjectKey(trimmed);
    const matchedCommon = COMMON_SCHOOL_SUBJECTS.find(
      (s) => normalizeSubjectKey(s) === inputKey
    );
    if (matchedCommon) {
      return { canonicalName: matchedCommon, isNewCustom: false };
    }
    const matchedCustom = currentCustomList.find(
      (s) => normalizeSubjectKey(s) === inputKey
    );
    if (matchedCustom) {
      return { canonicalName: matchedCustom, isNewCustom: false };
    }
    return { canonicalName: trimmed, isNewCustom: true };
  };

  const handleSelectChange = (day: DayOfWeek, idx: number, value: string) => {
    setFormError(null);
    const rowKey = `${day}-${idx}`;
    if (value === CUSTOM_OPTION_VALUE) {
      setCustomInputRows((prev) => ({
        ...prev,
        [rowKey]: "",
      }));
      return;
    }

    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].map((s, i) => (i === idx ? value : s)),
    }));
  };

  const handleConfirmCustomRow = (day: DayOfWeek, idx: number) => {
    const rowKey = `${day}-${idx}`;
    const rawVal = (customInputRows[rowKey] || "").trim();
    if (!rawVal) return;

    const { canonicalName, isNewCustom } = resolveCanonicalSubjectName(
      rawVal,
      localCustomSubjects
    );

    if (isNewCustom) {
      setLocalCustomSubjects((prev) => [...prev, canonicalName]);
    }

    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].map((s, i) => (i === idx ? canonicalName : s)),
    }));

    setCustomInputRows((prev) => {
      const next = { ...prev };
      delete next[rowKey];
      return next;
    });
    setFormError(null);
  };

  const handleCancelCustomRow = (day: DayOfWeek, idx: number) => {
    const rowKey = `${day}-${idx}`;
    setCustomInputRows((prev) => {
      const next = { ...prev };
      delete next[rowKey];
      return next;
    });
  };

  const handleAddSubjectRow = (day: DayOfWeek) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), ""],
    }));
  };

  const handleRemoveSubjectRow = (day: DayOfWeek, idx: number) => {
    setCustomInputRows((prev) => {
      const next: Record<string, string> = {};
      Object.entries(prev).forEach(([k, val]) => {
        const [dPart, iPart] = k.split("-");
        const rowIdx = parseInt(iPart, 10);
        if (dPart !== day || isNaN(rowIdx)) {
          next[k] = val;
        } else if (rowIdx < idx) {
          next[k] = val;
        } else if (rowIdx > idx) {
          next[`${day}-${rowIdx - 1}`] = val;
        }
      });
      return next;
    });
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== idx),
    }));
  };

  const handleRemoveCustomSubjectTag = (subjToRemove: string) => {
    setLocalCustomSubjects((prev) => prev.filter((s) => s !== subjToRemove));
  };

  const handleApplyPreset = (preset: ClassConfig, isSija: boolean) => {
    setClassName(preset.className);
    setSchedule(preset.schedule);
    if (isSija) {
      setLocalCustomSubjects((prev) =>
        Array.from(new Set([...prev, ...DEFAULT_SIJA_CUSTOM_SUBJECTS]))
      );
      setSelectedPresetTag("SIJA");
    } else {
      setSelectedPresetTag("SMA");
    }
    setCustomInputRows({});
    setFormError(null);
    setRestoreFeedback({
      type: "success",
      message: `Preset jadwal ${preset.className} dimuat ke tampilan. Klik "Simpan Jadwal Kelas" di bawah untuk menerapkan.`,
    });
  };

  const handleClearToEmptySlots = () => {
    setClassName("");
    setSchedule({
      SENIN: ["", "", "", ""],
      SELASA: ["", "", "", ""],
      RABU: ["", "", "", ""],
      KAMIS: ["", "", "", ""],
      JUMAT: ["", ""],
    });
    setCustomInputRows({});
    setSelectedPresetTag(null);
    setFormError(null);
  };

  const buildMergedAndCleanedData = () => {
    const mergedSchedule: WeeklyScheduleMap = {
      SENIN: [...(schedule.SENIN || [])],
      SELASA: [...(schedule.SELASA || [])],
      RABU: [...(schedule.RABU || [])],
      KAMIS: [...(schedule.KAMIS || [])],
      JUMAT: [...(schedule.JUMAT || [])],
    };
    const mergedCustom = [...localCustomSubjects];

    Object.entries(customInputRows).forEach(([rowKey, textVal]) => {
      const trimmed = textVal.trim();
      if (!trimmed) return;
      const [dayPart, idxPart] = rowKey.split("-");
      const day = dayPart as DayOfWeek;
      const idx = parseInt(idxPart, 10);
      if (
        mergedSchedule[day] &&
        !isNaN(idx) &&
        mergedSchedule[day][idx] !== undefined
      ) {
        const { canonicalName, isNewCustom } = resolveCanonicalSubjectName(
          trimmed,
          mergedCustom
        );
        mergedSchedule[day][idx] = canonicalName;
        if (isNewCustom) {
          mergedCustom.push(canonicalName);
        }
      }
    });

    const dedupeDayList = (list: string[]): string[] => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const item of list) {
        const t = item.trim();
        if (!t) continue;
        const k = normalizeSubjectKey(t);
        if (!seen.has(k)) {
          seen.add(k);
          out.push(t);
        }
      }
      return out;
    };

    const cleanedSchedule: WeeklyScheduleMap = {
      SENIN: dedupeDayList(mergedSchedule.SENIN),
      SELASA: dedupeDayList(mergedSchedule.SELASA),
      RABU: dedupeDayList(mergedSchedule.RABU),
      KAMIS: dedupeDayList(mergedSchedule.KAMIS),
      JUMAT: dedupeDayList(mergedSchedule.JUMAT),
    };

    const totalSubjects = DAYS_OF_WEEK.reduce(
      (acc, d) => acc + cleanedSchedule[d].length,
      0
    );

    return {
      trimmedClassName: className.trim(),
      cleanedSchedule,
      mergedCustom,
      totalSubjects,
    };
  };

  const handleCopyBackupCode = async () => {
    const {
      trimmedClassName,
      cleanedSchedule,
      mergedCustom,
      totalSubjects,
    } = buildMergedAndCleanedData();

    if (!trimmedClassName || totalSubjects === 0) {
      setRestoreFeedback({
        type: "error",
        message:
          "Isi Nama Kelas dan pilih minimal 1 mata pelajaran terlebih dahulu sebelum menyalin Kode Cadangan.",
      });
      return;
    }

    const code = encodeScheduleBackup({
      v: 1,
      className: trimmedClassName,
      schedule: cleanedSchedule,
      customSubjects: mergedCustom,
    });
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleCopyShareLink = async () => {
    const {
      trimmedClassName,
      cleanedSchedule,
      mergedCustom,
      totalSubjects,
    } = buildMergedAndCleanedData();

    if (!trimmedClassName || totalSubjects === 0) {
      setRestoreFeedback({
        type: "error",
        message:
          "Isi Nama Kelas dan pilih minimal 1 mata pelajaran terlebih dahulu sebelum menyalin Link Jadwal Kelas.",
      });
      return;
    }

    const code = encodeScheduleBackup({
      v: 1,
      className: trimmedClassName,
      schedule: cleanedSchedule,
      customSubjects: mergedCustom,
    });
    if (!code || typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}?jadwal=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleRestoreFromCode = () => {
    if (!restoreCodeInput.trim()) return;
    const decoded = decodeScheduleBackup(restoreCodeInput);
    if (!decoded) {
      setRestoreFeedback({
        type: "error",
        message:
          "Kode cadangan tidak valid. Pastikan Anda menyalin seluruh teks kode atau link jadwal dengan benar.",
      });
      return;
    }

    setClassName(decoded.className);
    setSchedule(decoded.schedule);
    if (decoded.customSubjects && decoded.customSubjects.length > 0) {
      setLocalCustomSubjects((prev) =>
        Array.from(new Set([...prev, ...(decoded.customSubjects || [])]))
      );
    }
    setCustomInputRows({});
    setRestoreCodeInput("");
    setFormError(null);
    setRestoreFeedback({
      type: "success",
      message: `Berhasil memuat jadwal kelas "${decoded.className}"! Klik tombol "Simpan Jadwal Kelas" untuk menyimpan.`,
    });
  };

  const handleSaveAll = () => {
    const {
      trimmedClassName,
      cleanedSchedule,
      mergedCustom,
      totalSubjects,
    } = buildMergedAndCleanedData();

    if (!trimmedClassName) {
      setFormError(
        "Yuk, isi Nama Kelasmu terlebih dahulu di kolom atas (contoh: XI MIPA 2, X TKJ 1, atau XII SIJA 1)."
      );
      if (classNameInputRef.current) {
        classNameInputRef.current.focus();
      }
      return;
    }

    if (totalSubjects === 0) {
      setFormError(
        "Pilih minimal 1 mata pelajaran pada kartu hari di bawah sebelum menyimpan jadwal."
      );
      return;
    }

    onSaveConfig(
      {
        className: trimmedClassName,
        schedule: cleanedSchedule,
      },
      mergedCustom,
      selectedPresetTag === "SIJA"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#F3EFE6] neo-card w-full max-w-6xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Top Decorative Strip */}
        <div className="h-2 w-full bg-hazard-stripes border-b-2 border-[#141413] shrink-0" />

        {/* Modal Header */}
        <div className="bg-[#C8F560] border-b-2 border-[#141413] px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFFDF9] border-2 border-[#141413] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#141413] -rotate-2 shrink-0">
              <CalendarCog className="w-5 h-5 text-[#141413] stroke-[2.4]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-extrabold uppercase tracking-tight text-[#141413]">
                Atur Jadwal Pelajaran Kelas
              </h2>
              <p className="text-xs font-semibold text-[#141413]/80">
                Susun mapel Senin–Jumat lewat pilihan dropdown atau ketik mapel khusus jurusanmu sendiri
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-[#FFFDF9] neo-btn-sm flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Tutup pengaturan jadwal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {formError && (
            <div className="bg-[#FF7A59] text-[#141413] neo-card-sm p-3.5 flex items-center gap-2.5 text-xs sm:text-sm font-extrabold">
              <AlertCircle className="w-5 h-5 stroke-[2.5] shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Baris Atas: Input Nama Kelas & Tombol Preset Cepat */}
          <div className="bg-[#FFFDF9] p-4 neo-card-sm flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#141413] mb-1.5">
                Nama Kelasmu (Wajib Diisi)
              </label>
              <input
                ref={classNameInputRef}
                type="text"
                value={className}
                onChange={(e) => {
                  setClassName(e.target.value);
                  setFormError(null);
                }}
                placeholder="Ketik nama kelasmu (cth: XI MIPA 2, X DKV 1, XII SIJA 1)..."
                className="w-full neo-input px-3.5 py-2 text-sm font-bold"
              />
            </div>

            {/* Pilihan Preset Cepat */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase text-[#141413]/70 mr-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" />
                <span> Contoh / Preset:</span>
              </span>
              <button
                type="button"
                onClick={handleClearToEmptySlots}
                className="px-3 py-2 bg-[#F3EFE6] hover:bg-[#FF7A59] text-[#141413] text-xs font-extrabold neo-btn-sm cursor-pointer"
              >
                Kosongkan Semua Slot
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(DEFAULT_CLASS_CONFIG, true)}
                className="px-3 py-2 bg-[#C8F560] hover:bg-[#b8e84b] text-[#141413] text-xs font-extrabold neo-btn-sm cursor-pointer"
              >
                ⚡ Preset XII SIJA 1
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(GENERAL_SMA_CLASS_CONFIG, false)
                }
                className="px-3 py-2 bg-[#DDD6FE] hover:bg-[#C4B5FD] text-[#141413] text-xs font-extrabold neo-btn-sm cursor-pointer"
              >
                Preset Umum SMA/SMK
              </button>
            </div>
          </div>

          {/* 5 KARTU HARI (GRID INTERAKTIF SENIN - JUMAT) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#141413] stroke-[2.5]" />
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-[#141413]">
                  Kartu Jadwal Harian (Senin – Jumat)
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#141413]/75">
                Pilih mapel dari daftar atau klik{" "}
                <strong className="text-[#141413]">
                  + Tambah Mapel Khusus (Ketik Sendiri)...
                </strong>{" "}
                di dalam dropdown
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
              {DAYS_OF_WEEK.map((day) => {
                const daySubjects = schedule[day] || [];
                const filledCount = daySubjects.filter((s) => s.trim()).length;
                const headerColor = DAY_CARD_COLORS[day];

                return (
                  <div
                    key={day}
                    className="bg-[#FFFDF9] neo-card-sm overflow-hidden flex flex-col"
                  >
                    {/* Header Kartu Hari */}
                    <div
                      className={`${headerColor} px-3.5 py-2.5 border-b-2 border-[#141413] flex items-center justify-between`}
                    >
                      <span className="text-sm font-extrabold uppercase tracking-tight text-[#141413]">
                        {day}
                      </span>
                      <span className="font-mono text-[11px] font-extrabold bg-[#FFFDF9] text-[#141413] px-2 py-0.5 border border-[#141413] rounded-full">
                        {filledCount} Mapel
                      </span>
                    </div>

                    {/* Susunan Baris Mata Pelajaran (Jam ke-1, ke-2, dst.) */}
                    <div className="p-3 space-y-2.5 flex-1">
                      {daySubjects.length === 0 ? (
                        <div className="py-6 px-2 text-center border-2 border-dashed border-[#141413]/30 rounded-lg text-xs font-semibold text-[#141413]/60">
                          Belum ada mapel. Klik tombol + Tambah Mapel di bawah.
                        </div>
                      ) : (
                        daySubjects.map((subj, idx) => {
                          const rowKey = `${day}-${idx}`;
                          const isCustomEditing =
                            customInputRows[rowKey] !== undefined;

                          return (
                            <div
                              key={rowKey}
                              className="bg-[#F3EFE6] p-2 border-2 border-[#141413] rounded-lg space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-[#FFFDF9] border border-[#141413] rounded">
                                  Jam ke-{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveSubjectRow(day, idx)
                                  }
                                  className="w-5 h-5 bg-[#FFFDF9] hover:bg-[#FF7A59] border border-[#141413] rounded flex items-center justify-center text-xs font-extrabold text-[#141413] cursor-pointer"
                                  title="Hapus baris mapel ini"
                                >
                                  ×
                                </button>
                              </div>

                              {isCustomEditing ? (
                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    value={customInputRows[rowKey]}
                                    onChange={(e) =>
                                      setCustomInputRows((prev) => ({
                                        ...prev,
                                        [rowKey]: e.target.value,
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleConfirmCustomRow(day, idx);
                                      }
                                    }}
                                    placeholder="Ketik nama mapel..."
                                    autoFocus
                                    className="w-full neo-input px-2 py-1.5 text-xs font-bold uppercase"
                                  />
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleConfirmCustomRow(day, idx)
                                      }
                                      className="flex-1 py-1 bg-[#C8F560] hover:bg-[#b8e84b] border border-[#141413] rounded text-[11px] font-extrabold cursor-pointer"
                                    >
                                      ✓ Simpan
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCancelCustomRow(day, idx)
                                      }
                                      className="px-2 py-1 bg-[#FFFDF9] border border-[#141413] rounded text-[11px] font-bold cursor-pointer"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <select
                                  value={subj}
                                  onChange={(e) =>
                                    handleSelectChange(day, idx, e.target.value)
                                  }
                                  aria-label={`Pilih mapel hari ${day} jam ke-${idx + 1}`}
                                  className={`w-full neo-input px-2 py-1.5 text-xs font-extrabold uppercase cursor-pointer ${
                                    !subj ? "text-[#141413]/55" : "text-[#141413]"
                                  }`}
                                >
                                  <option value="">-- Pilih Mapel --</option>
                                  <optgroup label="Mapel Umum Sekolah">
                                    {COMMON_SCHOOL_SUBJECTS.map((commonSubj) => (
                                      <option
                                        key={`common-${commonSubj}`}
                                        value={commonSubj}
                                      >
                                        {commonSubj}
                                      </option>
                                    ))}
                                  </optgroup>

                                  {allCustomAndScheduleSubjects.length > 0 && (
                                    <optgroup label="Mapel Khusus / Jurusan Anda">
                                      {allCustomAndScheduleSubjects.map(
                                        (customSubj) => (
                                          <option
                                            key={`custom-${customSubj}`}
                                            value={customSubj}
                                          >
                                            {customSubj}
                                          </option>
                                        )
                                      )}
                                    </optgroup>
                                  )}

                                  <optgroup label="Mapel Lainnya">
                                    <option value={CUSTOM_OPTION_VALUE}>
                                      + Tambah Mapel Khusus (Ketik Sendiri)...
                                    </option>
                                  </optgroup>
                                </select>
                              )}
                            </div>
                          );
                        })
                      )}

                      {/* Tombol + Tambah Mapel di Bawah Kartu Hari */}
                      <button
                        type="button"
                        onClick={() => handleAddSubjectRow(day)}
                        className="w-full py-2 px-2 bg-[#FFFDF9] hover:bg-[#C8F560] text-[#141413] text-xs font-extrabold uppercase border-2 border-dashed border-[#141413] rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
                        <span>Tambah Mapel</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daftar Mapel Khusus Privat yang Tersimpan di Perangkat Ini */}
            {localCustomSubjects.length > 0 && (
              <div className="mt-3 bg-[#FFFDF9] px-3.5 py-2.5 border-2 border-[#141413] rounded-xl flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-extrabold uppercase text-[#141413]/80 mr-1">
                  Mapel Khusus Tersimpan di Perangkat Ini:
                </span>
                {localCustomSubjects.map((customSubj) => (
                  <span
                    key={customSubj}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#DDD6FE] border border-[#141413] rounded-full text-[11px] font-bold"
                  >
                    <span>{customSubj}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomSubjectTag(customSubj)}
                      className="hover:text-[#FF5A36] font-extrabold cursor-pointer ml-0.5"
                      title="Hapus dari daftar pilihan mapel khusus"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 3. BAGIAN CADANGKAN & BAGIKAN JADWAL (BACKUP/RESTORE CODE & SHARE LINK) */}
          <div
            ref={backupSectionRef}
            className="bg-[#D1FAE5] p-4 sm:p-5 neo-card-sm space-y-3.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#141413] pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-[#141413]">
                  Cadangkan & Bagikan Jadwal (Tanpa Login)
                </h3>
                <p className="text-xs font-semibold text-[#141413]/80">
                  Simpan kode ini di chat/pesan berbintang WhatsApp agar jadwal bisa dipulihkan kapan saja jika data browser terhapus.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyBackupCode}
                  className="px-3.5 py-2 bg-[#FFFDF9] hover:bg-[#C8F560] text-[#141413] text-xs font-extrabold neo-btn-sm cursor-pointer flex items-center gap-1.5"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                      <span>Kode Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 stroke-[2.4]" />
                      <span>Salin Kode Cadangan</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="px-3.5 py-2 bg-[#FF5A36] hover:bg-[#ff6b4a] text-[#FFFDF9] text-xs font-extrabold neo-btn-sm cursor-pointer flex items-center gap-1.5"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                      <span>Link Jadwal Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 stroke-[2.4]" />
                      <span>Salin Link Jadwal Kelas</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Kolom Pulihkan dari Kode */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={restoreCodeInput}
                onChange={(e) => setRestoreCodeInput(e.target.value)}
                placeholder="Tempel (paste) kode cadangan atau link jadwal kelas di sini untuk memulihkan..."
                className="flex-1 neo-input px-3 py-2 text-xs font-mono font-bold"
              />
              <button
                type="button"
                onClick={handleRestoreFromCode}
                className="px-4 py-2 bg-[#141413] hover:bg-[#27272A] text-[#C8F560] text-xs font-extrabold neo-btn-sm cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Pulihkan dari Kode</span>
              </button>
            </div>

            {restoreFeedback && (
              <div
                className={`p-2.5 border-2 border-[#141413] rounded-lg text-xs font-bold ${
                  restoreFeedback.type === "success"
                    ? "bg-[#C8F560] text-[#141413]"
                    : "bg-[#FF7A59] text-[#141413]"
                }`}
              >
                {restoreFeedback.message}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FFFDF9] border-t-2 border-[#141413] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-semibold text-[#141413]/75">
            Perubahan disimpan secara permanen di browser perangkat Anda
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#F3EFE6] text-[#141413] font-bold text-xs px-4 py-2.5 neo-btn-sm cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="bg-[#C8F560] hover:bg-[#b8e84b] text-[#141413] font-extrabold text-xs sm:text-sm px-5 py-2.5 neo-btn-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Jadwal Kelas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
