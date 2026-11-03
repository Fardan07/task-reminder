"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { Header } from "@/components/Header";
import { HeroOnboardingSection } from "@/components/HeroOnboardingSection";
import { TaskFormPanel } from "@/components/TaskFormPanel";
import { ReminderPreviewPanel } from "@/components/ReminderPreviewPanel";
import { TaskListSection } from "@/components/TaskListSection";
import { ScheduleModal } from "@/components/ScheduleModal";
import {
  ClassConfig,
  DayOfWeek,
  ScheduleBackupPayload,
  SubjectDraft,
} from "@/types/task";
import {
  DAYS_OF_WEEK,
  DEFAULT_CLASS_CONFIG,
  DEFAULT_SIJA_CUSTOM_SUBJECTS,
  EMPTY_CLASS_CONFIG,
  INITIAL_SUBJECT_DRAFTS,
  decodeScheduleBackup,
  getDayOfWeekFromIsoDate,
  getSmartTargetDayAndDate,
  getUpcomingDateForDay,
  normalizeSubjectKey,
} from "@/data/mockData";
import {
  CheckCircle2,
  Download,
  Share2,
  X,
  AlertCircle,
} from "lucide-react";

const STORAGE_DRAFTS_KEY = "sekrekita_drafts_v1";
const STORAGE_CONFIG_KEY = "sekrekita_class_config_v1";
const STORAGE_CUSTOM_SUBJECTS_KEY = "sekrekita_custom_subjects";
const STORAGE_HIDE_HERO_KEY = "sekrekita_hide_hero";

const emptySubscribe = () => () => {};

function hasSavedScheduleInStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (!saved) return false;
    const parsed = JSON.parse(saved) as ClassConfig;
    if (!parsed?.className || !parsed?.schedule) return false;
    const totalSubj = DAYS_OF_WEEK.reduce(
      (acc, d) => acc + (parsed.schedule[d]?.length || 0),
      0
    );
    return totalSubj > 0;
  } catch {
    return false;
  }
}

function loadInitialClassConfig(): ClassConfig {
  if (typeof window === "undefined") return EMPTY_CLASS_CONFIG;
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as ClassConfig;
      if (parsed?.className && parsed?.schedule) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load class config from localStorage:", e);
  }
  return EMPTY_CLASS_CONFIG;
}

function loadInitialDrafts(): Record<string, SubjectDraft> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(STORAGE_DRAFTS_KEY);
    if (saved) {
      return JSON.parse(saved) as Record<string, SubjectDraft>;
    }
  } catch (e) {
    console.error("Failed to load drafts from localStorage:", e);
  }
  return {};
}

function loadInitialCustomSubjects(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_CUSTOM_SUBJECTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    }
  } catch (e) {
    console.error("Failed to load custom subjects from localStorage:", e);
  }
  return [];
}

function loadInitialHideHero(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_HIDE_HERO_KEY) === "true";
  } catch {
    return false;
  }
}

function loadSharedScheduleFromUrl(): ScheduleBackupPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("jadwal");
    if (!encoded) return null;
    return decodeScheduleBackup(encoded);
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const onboardingRestoreInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const smartTomorrow = useMemo(() => getSmartTargetDayAndDate(), []);

  const [isScheduleConfigured, setIsScheduleConfigured] = useState<boolean>(
    hasSavedScheduleInStorage
  );
  const [classConfig, setClassConfig] = useState<ClassConfig>(
    loadInitialClassConfig
  );
  const [drafts, setDrafts] =
    useState<Record<string, SubjectDraft>>(loadInitialDrafts);
  const [customSubjects, setCustomSubjects] = useState<string[]>(
    loadInitialCustomSubjects
  );
  const [hideHero, setHideHero] = useState<boolean>(loadInitialHideHero);
  const [pendingSharedSchedule, setPendingSharedSchedule] =
    useState<ScheduleBackupPayload | null>(loadSharedScheduleFromUrl);

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(smartTomorrow.day);
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(
    smartTomorrow.isoDate
  );

  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [focusBackupInModal, setFocusBackupInModal] = useState(false);
  const [startEmptyInModal, setStartEmptyInModal] = useState(false);

  // Onboarding inline restore states
  const [showOnboardingRestore, setShowOnboardingRestore] = useState(false);
  const [onboardingRestoreCode, setOnboardingRestoreCode] = useState("");
  const [onboardingRestoreError, setOnboardingRestoreError] = useState<
    string | null
  >(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Permanently sync drafts to localStorage once schedule is configured
  useEffect(() => {
    if (isClient && isScheduleConfigured) {
      try {
        localStorage.setItem(STORAGE_DRAFTS_KEY, JSON.stringify(drafts));
      } catch (e) {
        console.error("Failed to save drafts to localStorage:", e);
      }
    }
  }, [drafts, isClient, isScheduleConfigured]);

  // Permanently sync classConfig to localStorage once schedule is configured
  useEffect(() => {
    if (isClient && isScheduleConfigured) {
      try {
        localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(classConfig));
      } catch (e) {
        console.error("Failed to save class config to localStorage:", e);
      }
    }
  }, [classConfig, isClient, isScheduleConfigured]);

  // Permanently sync customSubjects to localStorage once schedule is configured
  useEffect(() => {
    if (isClient && isScheduleConfigured) {
      try {
        localStorage.setItem(
          STORAGE_CUSTOM_SUBJECTS_KEY,
          JSON.stringify(customSubjects)
        );
      } catch (e) {
        console.error("Failed to save custom subjects to localStorage:", e);
      }
    }
  }, [customSubjects, isClient, isScheduleConfigured]);

  // Sync hideHero to localStorage
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_HIDE_HERO_KEY, String(hideHero));
      } catch (e) {
        console.error("Failed to save hero visibility state:", e);
      }
    }
  }, [hideHero, isClient]);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2600);
  };

  const clearUrlQueryParam = () => {
    if (typeof window !== "undefined" && window.location.search) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  };

  const handleApplySharedSchedule = () => {
    if (!pendingSharedSchedule) return;
    const newConfig: ClassConfig = {
      className: pendingSharedSchedule.className,
      schedule: pendingSharedSchedule.schedule,
    };
    const mergedCustom = Array.from(
      new Set([...customSubjects, ...(pendingSharedSchedule.customSubjects || [])])
    );

    setClassConfig(newConfig);
    setCustomSubjects(mergedCustom);
    setIsScheduleConfigured(true);
    setPendingSharedSchedule(null);
    clearUrlQueryParam();
    showToast(
      `Jadwal kelas ${pendingSharedSchedule.className} berhasil diterapkan & disimpan permanen!`
    );
  };

  const handleDismissSharedSchedule = () => {
    setPendingSharedSchedule(null);
    clearUrlQueryParam();
  };

  const handleScrollToWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleOpenScheduleModal = (
    focusBackup = false,
    startEmpty = false
  ) => {
    setFocusBackupInModal(focusBackup);
    setStartEmptyInModal(startEmpty);
    setIsScheduleModalOpen(true);
  };

  // Shortcut Button 2 on Onboarding: Load XII SIJA 1 Preset in 1 click
  const handleUseSijaPreset = () => {
    setClassConfig(DEFAULT_CLASS_CONFIG);
    setCustomSubjects(DEFAULT_SIJA_CUSTOM_SUBJECTS);
    setDrafts(INITIAL_SUBJECT_DRAFTS);
    setIsScheduleConfigured(true);

    localStorage.setItem(
      STORAGE_CONFIG_KEY,
      JSON.stringify(DEFAULT_CLASS_CONFIG)
    );
    localStorage.setItem(
      STORAGE_CUSTOM_SUBJECTS_KEY,
      JSON.stringify(DEFAULT_SIJA_CUSTOM_SUBJECTS)
    );
    localStorage.setItem(
      STORAGE_DRAFTS_KEY,
      JSON.stringify(INITIAL_SUBJECT_DRAFTS)
    );

    const target = getSmartTargetDayAndDate();
    setSelectedDay(target.day);
    setSelectedIsoDate(target.isoDate);
    showToast("⚡ Preset jadwal XII SIJA 1 berhasil dimuat & disimpan permanen!");
  };

  // Shortcut Button 3 on Onboarding: Restore from Backup Code
  const handleOnboardingRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingRestoreCode.trim()) return;

    const decoded = decodeScheduleBackup(onboardingRestoreCode);
    if (!decoded) {
      setOnboardingRestoreError(
        "Kode cadangan atau link tidak valid. Pastikan kamu menyalin seluruh kode dengan lengkap."
      );
      return;
    }

    const newConfig: ClassConfig = {
      className: decoded.className,
      schedule: decoded.schedule,
    };
    const mergedCustom = decoded.customSubjects || [];

    setClassConfig(newConfig);
    setCustomSubjects(mergedCustom);
    setIsScheduleConfigured(true);
    setOnboardingRestoreCode("");
    setOnboardingRestoreError(null);
    setShowOnboardingRestore(false);

    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(newConfig));
    localStorage.setItem(
      STORAGE_CUSTOM_SUBJECTS_KEY,
      JSON.stringify(mergedCustom)
    );

    showToast(
      `🔑 Jadwal kelas ${decoded.className} berhasil dipulihkan & disimpan permanen!`
    );
  };

  // Switch day tab and automatically update date to upcoming date of that day
  const handleSelectDay = (day: DayOfWeek) => {
    setSelectedDay(day);
    if (day === smartTomorrow.day) {
      setSelectedIsoDate(smartTomorrow.isoDate);
    } else {
      setSelectedIsoDate(getUpcomingDateForDay(day));
    }
  };

  // Sync selectedDay when user picks a date in the date picker
  const handleChangeIsoDate = (newIsoDate: string) => {
    setSelectedIsoDate(newIsoDate);
    const detectedDay = getDayOfWeekFromIsoDate(newIsoDate);
    if (detectedDay && detectedDay !== "WEEKEND") {
      setSelectedDay(detectedDay);
    } else if (detectedDay === "WEEKEND") {
      showToast(
        "Tanggal yang dipilih jatuh di akhir pekan. Menampilkan jadwal hari Senin."
      );
      setSelectedDay("SENIN");
    }
  };

  const handleJumpToTomorrow = () => {
    const fresh = getSmartTargetDayAndDate();
    setSelectedDay(fresh.day);
    setSelectedIsoDate(fresh.isoDate);
    showToast(`Kembali ke jadwal hari besok (${fresh.day})`);
  };

  const handleUpdateSubjectDraft = (
    subjectName: string,
    updatedDraft: SubjectDraft
  ) => {
    const key = normalizeSubjectKey(subjectName);
    setDrafts((prev) => ({
      ...prev,
      [key]: updatedDraft,
    }));
  };

  const handleClearSubjectDraft = (subjectName: string) => {
    const key = normalizeSubjectKey(subjectName);
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    showToast(`Tugas ${subjectName} direset menjadi - -`);
  };

  const handleClearAllDaySubjects = (day: DayOfWeek) => {
    const daySubjects = classConfig.schedule[day] || [];
    setDrafts((prev) => {
      const next = { ...prev };
      daySubjects.forEach((subj) => {
        const key = normalizeSubjectKey(subj);
        const existing = next[key];
        if (
          existing &&
          (existing.targetDay === "ALL" || existing.targetDay === day)
        ) {
          delete next[key];
        }
      });
      return next;
    });
    showToast(`Seluruh mapel hari ${day} dikosongkan (- -)`);
  };

  const handleSaveClassConfig = (
    newConfig: ClassConfig,
    updatedCustomSubjects: string[],
    isSijaPreset = false
  ) => {
    setClassConfig(newConfig);
    setCustomSubjects(updatedCustomSubjects);
    if (isSijaPreset && Object.keys(drafts).length === 0) {
      setDrafts(INITIAL_SUBJECT_DRAFTS);
      localStorage.setItem(
        STORAGE_DRAFTS_KEY,
        JSON.stringify(INITIAL_SUBJECT_DRAFTS)
      );
    }
    setIsScheduleConfigured(true);
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(newConfig));
    localStorage.setItem(
      STORAGE_CUSTOM_SUBJECTS_KEY,
      JSON.stringify(updatedCustomSubjects)
    );
    showToast(
      `Jadwal kelas ${newConfig.className} berhasil disimpan permanen di browser!`
    );
  };

  const handleResetAllData = () => {
    if (
      !window.confirm(
        "Apakah kamu yakin ingin mengosongkan jadwal dan catatan tugas di browser ini? (Pastikan kamu sudah menyalin Kode Cadangan jika ingin menyimpannya)."
      )
    ) {
      return;
    }

    localStorage.removeItem(STORAGE_CONFIG_KEY);
    localStorage.removeItem(STORAGE_DRAFTS_KEY);
    localStorage.removeItem(STORAGE_CUSTOM_SUBJECTS_KEY);

    setClassConfig(EMPTY_CLASS_CONFIG);
    setDrafts({});
    setCustomSubjects([]);
    setIsScheduleConfigured(false);
    setShowOnboardingRestore(false);
    showToast("Jadwal kelas berhasil dikosongkan.");
  };

  const activeSubjectCount = useMemo(() => {
    return Object.values(drafts).filter((d) => {
      const hasPoints = d.points.some((p) => p.text.trim().length > 0);
      const hasLinks = d.links.some((l) => l.url.trim().length > 0);
      return hasPoints || hasLinks;
    }).length;
  }, [drafts]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-zine-paper flex items-center justify-center p-4">
        <div className="bg-[#C8F560] neo-card px-6 py-4 font-mono text-sm font-extrabold uppercase -rotate-1">
          ✦ Memuat SEKREKITA...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zine-paper text-[#141413] flex flex-col justify-between relative overflow-x-hidden">
      <div>
        {/* Header SEKREKITA */}
        <Header
          classNameLabel={classConfig.className}
          activeSubjectCount={activeSubjectCount}
          isHeroVisible={!hideHero}
          isScheduleConfigured={isScheduleConfigured}
          onToggleHero={() => setHideHero((prev) => !prev)}
          onOpenScheduleModal={() =>
            handleOpenScheduleModal(false, !isScheduleConfigured)
          }
          onResetAllData={handleResetAllData}
        />

        {/* Floating Toast */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#141413] text-[#C8F560] neo-card-sm px-4 py-2.5 text-xs font-extrabold flex items-center gap-2 -rotate-1">
            <CheckCircle2 className="w-4 h-4 stroke-[2.6] shrink-0 text-[#FF5A36]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Banner Deteksi Link Jadwal Kelas (?jadwal=...) */}
          {pendingSharedSchedule && (
            <div className="mb-6 bg-[#DDD6FE] neo-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 bg-[#C8F560] border-2 border-[#141413] rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#141413]">
                  <Download className="w-5 h-5 text-[#141413] stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold uppercase text-[#141413]">
                    Tautan Jadwal Kelas Ditemukan: {pendingSharedSchedule.className}
                  </h2>
                  <p className="text-xs font-semibold text-[#141413]/80">
                    Apakah kamu ingin memuat dan menyimpan jadwal pelajaran kelas{" "}
                    <strong>{pendingSharedSchedule.className}</strong> ke browser ini?
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleApplySharedSchedule}
                  className="px-4 py-2 bg-[#C8F560] hover:bg-[#b8e84b] text-[#141413] text-xs font-extrabold neo-btn-sm cursor-pointer"
                >
                  Terapkan Jadwal Ini
                </button>
                <button
                  type="button"
                  onClick={handleDismissSharedSchedule}
                  className="p-2 bg-[#FFFDF9] hover:bg-[#FF7A59] text-[#141413] neo-btn-sm cursor-pointer"
                  title="Abaikan tautan jadwal"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* 1 & 2. SMART HERO BANNER + 3 LANGKAH GAMPANG PAKAI SEKREKITA */}
          {!hideHero && (
            <HeroOnboardingSection
              onStartWorking={handleScrollToWorkspace}
              onOpenScheduleModal={() =>
                handleOpenScheduleModal(false, !isScheduleConfigured)
              }
              onHideHero={() => setHideHero(true)}
            />
          )}

          {/* Area Kerja Utama */}
          <div ref={workspaceRef} id="workspace-area" className="scroll-mt-24">
            {!isScheduleConfigured ? (
              /* KONDISI PENGUNJUNG BARU: BANNER/KARTU ONBOARDING SETUP JADWAL */
              <section className="bg-[#FFFDF9] neo-card overflow-hidden relative">
                <div className="h-3 w-full bg-hazard-stripes border-b-2 border-[#141413]" />

                <div className="p-6 sm:p-10 text-center max-w-3xl mx-auto space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#DDD6FE] border-2 border-[#141413] rounded-full text-xs font-extrabold text-[#141413] shadow-[2px_2px_0px_#141413] -rotate-1">
                    <span>✨ Langkah Pertama • Cuma Butuh 1 Menit</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight leading-snug">
                    👋 Selamat Datang di SEKREKITA! Yuk, Buat Jadwal Kelasmu Dulu
                  </h2>

                  <p className="text-xs sm:text-sm font-semibold text-[#141413]/80 leading-relaxed max-w-2xl mx-auto">
                    Karena setiap kelas dan sekolah punya jadwal yang berbeda,
                    yuk atur jadwal pelajaran kelasmu dulu. Setelah disimpan,
                    jadwalmu otomatis terkunci permanen di browser ini tanpa
                    perlu login!
                  </p>

                  {/* 3 Tombol Pilihan Onboarding */}
                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3.5 pt-2">
                    {/* Tombol 1 (Utama - Acid Lime) */}
                    <button
                      type="button"
                      onClick={() => handleOpenScheduleModal(false, true)}
                      className="px-5 py-3.5 bg-[#C8F560] hover:bg-[#b8e84b] text-[#141413] text-xs sm:text-sm font-extrabold uppercase tracking-tight neo-btn cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>➕ Susun Jadwal Kelas Baru (Mulai dari Kosong)</span>
                    </button>

                    {/* Tombol 2 (Pintasan Cepat XII SIJA 1) */}
                    <button
                      type="button"
                      onClick={handleUseSijaPreset}
                      className="px-5 py-3.5 bg-[#FF5A36] hover:bg-[#ff6b4a] text-[#FFFDF9] text-xs sm:text-sm font-extrabold uppercase tracking-tight neo-btn cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>⚡ Pakai Preset XII SIJA 1</span>
                    </button>

                    {/* Tombol 3 (Restore Kode Cadangan) */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowOnboardingRestore((prev) => !prev);
                        setOnboardingRestoreError(null);
                        setTimeout(() => {
                          onboardingRestoreInputRef.current?.focus();
                        }, 80);
                      }}
                      className="px-5 py-3.5 bg-[#DDD6FE] hover:bg-[#C4B5FD] text-[#141413] text-xs sm:text-sm font-extrabold uppercase tracking-tight neo-btn cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>🔑 Punya Kode Cadangan? Pulihkan di Sini</span>
                    </button>
                  </div>

                  {/* Kolom Input Kode Cadangan Inline (Muncul saat Tombol 3 diklik) */}
                  {showOnboardingRestore && (
                    <div className="mt-5 p-4 sm:p-5 bg-[#D1FAE5] neo-card-sm text-left max-w-xl mx-auto space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold uppercase text-[#141413]">
                          🔑 Tempel Kode Cadangan atau Link Jadwal Kelas:
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowOnboardingRestore(false)}
                          className="text-xs font-bold underline cursor-pointer"
                        >
                          Tutup
                        </button>
                      </div>

                      <form
                        onSubmit={handleOnboardingRestoreSubmit}
                        className="flex flex-col sm:flex-row gap-2"
                      >
                        <input
                          ref={onboardingRestoreInputRef}
                          type="text"
                          value={onboardingRestoreCode}
                          onChange={(e) => {
                            setOnboardingRestoreCode(e.target.value);
                            setOnboardingRestoreError(null);
                          }}
                          placeholder="Paste kode cadangan atau URL ?jadwal=... di sini"
                          className="flex-1 neo-input px-3 py-2 text-xs font-mono font-bold"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#141413] hover:bg-[#27272A] text-[#C8F560] text-xs font-extrabold neo-btn-sm cursor-pointer shrink-0"
                        >
                          Pulihkan Jadwal
                        </button>
                      </form>

                      {onboardingRestoreError && (
                        <div className="p-2.5 bg-[#FF7A59] border-2 border-[#141413] rounded-lg text-xs font-bold text-[#141413] flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{onboardingRestoreError}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            ) : (
              /* KONDISI JADWAL SUDAH DIATUR: TAMPILKAN WORKSPACE UTAMA & PAPAN SEPEKAN */
              <>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Smart Day Ticket + Subject Quick-Draft Cards (7 cols) */}
                  <div className="lg:col-span-7">
                    <TaskFormPanel
                      selectedDay={selectedDay}
                      selectedIsoDate={selectedIsoDate}
                      smartTomorrowDay={smartTomorrow.day}
                      smartTomorrowIsoDate={smartTomorrow.isoDate}
                      schedule={classConfig.schedule}
                      drafts={drafts}
                      onSelectDay={handleSelectDay}
                      onChangeIsoDate={handleChangeIsoDate}
                      onJumpToTomorrow={handleJumpToTomorrow}
                      onUpdateSubjectDraft={handleUpdateSubjectDraft}
                      onClearSubjectDraft={handleClearSubjectDraft}
                      onClearAllDaySubjects={handleClearAllDaySubjects}
                      onOpenScheduleModal={() =>
                        handleOpenScheduleModal(false, false)
                      }
                    />
                  </div>

                  {/* Right Column: Sticky WhatsApp Console Preview & CTA (5 cols) */}
                  <div className="lg:col-span-5 lg:sticky lg:top-24">
                    <ReminderPreviewPanel
                      selectedDay={selectedDay}
                      selectedIsoDate={selectedIsoDate}
                      schedule={classConfig.schedule}
                      drafts={drafts}
                      classNameLabel={classConfig.className}
                    />
                  </div>
                </div>

                {/* Weekly Overview Board */}
                <TaskListSection
                  schedule={classConfig.schedule}
                  drafts={drafts}
                  selectedDay={selectedDay}
                  onSelectDay={handleSelectDay}
                  onClearSubjectDraft={handleClearSubjectDraft}
                  onOpenScheduleModal={() =>
                    handleOpenScheduleModal(false, false)
                  }
                />
              </>
            )}
          </div>

          {/* 3. BANNER EDUKASI "KENAPA GAK PERLU LOGIN?" (ZINE TICKET STYLE) */}
          <section className="mt-8 bg-[#DDD6FE] neo-card relative overflow-hidden">
            {/* Ticket Top Section */}
            <div className="p-5 sm:p-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-[#FFFDF9] border-2 border-[#141413] rounded-full text-xs font-extrabold text-[#141413] shadow-[2px_2px_0px_#141413] mb-3 -rotate-1">
                <span>✦ Privasi & Keamanan Data Kelas</span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-[#141413] tracking-tight">
                🔒 Kenapa Gak Perlu Daftar Akun / Login?
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#141413]/85 mt-2 leading-relaxed max-w-4xl">
                SEKREKITA dirancang sepraktis buku saku di laci mejamu. Semua
                jadwal dan catatan tugasmu tersimpan langsung secara privat di
                browser perangkatmu (tidak tercampur dengan kelas lain). Supaya
                jadwalmu tetap aman kalau ganti HP atau hapus cache browser,
                cukup simpan Kode Cadangan atau Link Jadwal Kelasmu di chat
                WhatsApp!
              </p>
            </div>

            {/* Ticket Perforation Divider with Left & Right Punch Notches */}
            <div className="relative flex items-center justify-between">
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

            {/* Ticket Bottom Action Bar */}
            <div className="p-4 sm:p-5 bg-[#FFFDF9]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#141413]/80">
                Tips: Kirim Link Jadwal Kelas ke grup pengurus kelas supaya wakil
                sekretaris juga punya jadwal yang sama!
              </span>

              <button
                type="button"
                onClick={() => handleOpenScheduleModal(true, false)}
                className="px-4 py-2.5 bg-[#C8F560] hover:bg-[#b8e84b] text-[#141413] text-xs font-extrabold uppercase tracking-tight neo-btn-sm cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Cadangkan / Salin Link Jadwal Sekarang</span>
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* Modal Atur Jadwal Kelas */}
      {isScheduleModalOpen && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setFocusBackupInModal(false);
            setStartEmptyInModal(false);
          }}
          classConfig={classConfig}
          customSubjects={customSubjects}
          focusBackupOnOpen={focusBackupInModal}
          startEmptyMode={startEmptyInModal}
          onSaveConfig={handleSaveClassConfig}
        />
      )}

      {/* Footer Bersih & Hangat */}
      <footer className="w-full bg-[#FFFDF9] border-t-2 border-[#141413] mt-12 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-[#141413]">
          <div className="flex items-center gap-2">
            <span className="bg-[#141413] text-[#C8F560] px-2 py-0.5 border-2 border-[#141413] rounded font-extrabold uppercase">
              SEKREKITA
            </span>
            <span className="text-[#141413]/80">
              Dibuat untuk mempermudah hidup sekretaris kelas di seluruh Indonesia.
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setHideHero(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-xs font-extrabold underline decoration-[#FF5A36] decoration-2 underline-offset-4 hover:text-[#FF5A36] cursor-pointer"
          >
            Lihat Panduan Cara Pakai ↑
          </button>
        </div>
      </footer>
    </div>
  );
}
