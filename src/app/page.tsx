"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { Header } from "@/components/Header";
import { TaskFormPanel } from "@/components/TaskFormPanel";
import { ReminderPreviewPanel } from "@/components/ReminderPreviewPanel";
import { TaskListSection } from "@/components/TaskListSection";
import { ScheduleModal } from "@/components/ScheduleModal";
import { ClassConfig, DayOfWeek, SubjectDraft } from "@/types/task";
import {
  DEFAULT_CLASS_CONFIG,
  INITIAL_SUBJECT_DRAFTS,
  getSmartTargetDayAndDate,
  getUpcomingDateForDay,
  normalizeSubjectKey,
} from "@/data/mockData";
import { CheckCircle2 } from "lucide-react";

const STORAGE_DRAFTS_KEY = "sijasisten_neo_drafts_v1";
const STORAGE_CONFIG_KEY = "sijasisten_neo_class_config_v1";

const emptySubscribe = () => () => {};

function loadInitialClassConfig(): ClassConfig {
  if (typeof window === "undefined") return DEFAULT_CLASS_CONFIG;
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
  return DEFAULT_CLASS_CONFIG;
}

function loadInitialDrafts(): Record<string, SubjectDraft> {
  if (typeof window === "undefined") return INITIAL_SUBJECT_DRAFTS;
  try {
    const saved = localStorage.getItem(STORAGE_DRAFTS_KEY);
    if (saved) {
      return JSON.parse(saved) as Record<string, SubjectDraft>;
    }
  } catch (e) {
    console.error("Failed to load drafts from localStorage:", e);
  }
  return INITIAL_SUBJECT_DRAFTS;
}

export default function DashboardPage() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const smartTomorrow = useMemo(() => getSmartTargetDayAndDate(), []);

  const [classConfig, setClassConfig] = useState<ClassConfig>(
    loadInitialClassConfig
  );
  const [drafts, setDrafts] =
    useState<Record<string, SubjectDraft>>(loadInitialDrafts);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(smartTomorrow.day);
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(
    smartTomorrow.isoDate
  );
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync drafts to localStorage
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_DRAFTS_KEY, JSON.stringify(drafts));
      } catch (e) {
        console.error("Failed to save drafts to localStorage:", e);
      }
    }
  }, [drafts, isClient]);

  // Sync classConfig to localStorage
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(classConfig));
      } catch (e) {
        console.error("Failed to save class config to localStorage:", e);
      }
    }
  }, [classConfig, isClient]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
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
        delete next[normalizeSubjectKey(subj)];
      });
      return next;
    });
    showToast(`Seluruh mapel hari ${day} dikosongkan (- -)`);
  };

  const handleSaveClassConfig = (newConfig: ClassConfig) => {
    setClassConfig(newConfig);
    showToast(`Jadwal kelas ${newConfig.className} berhasil disimpan!`);
  };

  const handleResetAllData = () => {
    setClassConfig(DEFAULT_CLASS_CONFIG);
    setDrafts(INITIAL_SUBJECT_DRAFTS);
    localStorage.setItem(
      STORAGE_CONFIG_KEY,
      JSON.stringify(DEFAULT_CLASS_CONFIG)
    );
    localStorage.setItem(
      STORAGE_DRAFTS_KEY,
      JSON.stringify(INITIAL_SUBJECT_DRAFTS)
    );
    const target = getSmartTargetDayAndDate();
    setSelectedDay(target.day);
    setSelectedIsoDate(target.isoDate);
    showToast("Data jadwal & draft dikembalikan ke preset XII SIJA 1");
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
          ✦ Memuat SIJASISTEN // Zine OS...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zine-paper text-[#141413] flex flex-col justify-between relative overflow-x-hidden">
      <div>
        {/* Header Neo-Brutalist Zine */}
        <Header
          classNameLabel={classConfig.className}
          activeSubjectCount={activeSubjectCount}
          onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
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
                onChangeIsoDate={setSelectedIsoDate}
                onJumpToTomorrow={handleJumpToTomorrow}
                onUpdateSubjectDraft={handleUpdateSubjectDraft}
                onClearSubjectDraft={handleClearSubjectDraft}
                onClearAllDaySubjects={handleClearAllDaySubjects}
              />
            </div>

            {/* Right Column: Sticky WhatsApp Console Preview & CTA (5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <ReminderPreviewPanel
                selectedDay={selectedDay}
                selectedIsoDate={selectedIsoDate}
                schedule={classConfig.schedule}
                drafts={drafts}
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
          />
        </main>
      </div>

      {/* Modal Atur Jadwal Kelas */}
      {isScheduleModalOpen && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          classConfig={classConfig}
          onSaveConfig={handleSaveClassConfig}
          onResetToDefaultPreset={handleResetAllData}
        />
      )}

      {/* Footer */}
      <footer className="w-full bg-[#FFFDF9] border-t-2 border-[#141413] mt-12 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold text-[#141413]">
          <div className="flex items-center gap-2">
            <span className="bg-[#C8F560] px-2.5 py-0.5 border-2 border-[#141413] rounded-full font-extrabold -rotate-1">
              ✦ SIJASISTEN ZINE v2.5
            </span>
            <span>{"//"}</span>
            <span>Sekretaris Kelas {classConfig.className}</span>
          </div>
          <div className="font-mono text-[11px] font-bold text-[#141413]/70">
            [+] NEO-BRUTALIST ZINE EDITION • LOCALSTORAGE SYNC
          </div>
        </div>
      </footer>
    </div>
  );
}
