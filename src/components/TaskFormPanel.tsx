"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Save,
  CheckCircle2,
  Calendar,
  Sparkles,
  Check,
  AlertCircle,
  CalendarDays,
  Clock,
  BookOpen,
  PlusCircle,
  RotateCcw,
} from "lucide-react";
import {
  DayOfWeek,
  TaskItem,
  TaskType,
  SubmissionMethod,
} from "@/types/task";
import {
  WEEKLY_TIMETABLE,
  DEFAULT_DAY_DATES,
  SUBJECT_SCHEDULES,
} from "@/data/mockData";

interface TaskFormPanelProps {
  tasks: TaskItem[];
  onSaveDailyTasks: (day: DayOfWeek, dueDate: string, newTasks: TaskItem[]) => void;
  selectedDayTab: string;
  onSelectDayTab: (day: DayOfWeek) => void;
}

interface SubjectFormState {
  subjectName: string;
  hasTask: boolean;
  details: string;
  taskType: TaskType;
  deadlineTime: string;
  submissionMethod: SubmissionMethod;
}

const TASK_TYPES: TaskType[] = [
  "PR / Latihan",
  "Tugas Individu",
  "Tugas Kelompok",
  "Praktikum Lab",
  "Ulangan / Kuis",
];

const SUBMISSION_METHODS: SubmissionMethod[] = ["MyLms", "Buku Tulis"];

const DAYS: DayOfWeek[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export const TaskFormPanel: React.FC<TaskFormPanelProps> = ({
  tasks,
  onSaveDailyTasks,
  selectedDayTab,
  onSelectDayTab,
}) => {
  const currentDay = (
    DAYS.includes(selectedDayTab as DayOfWeek) ? selectedDayTab : "Rabu"
  ) as DayOfWeek;

  const [formDueDate, setFormDueDate] = useState<string>(
    DEFAULT_DAY_DATES[currentDay] || ""
  );

  const [subjectStates, setSubjectStates] = useState<SubjectFormState[]>([]);
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Sync form states whenever selectedDayTab or tasks change
  useEffect(() => {
    const daySubjects = WEEKLY_TIMETABLE[currentDay] || [];
    const dayTasks = tasks.filter((t) => t.day === currentDay);

    const existingDate =
      dayTasks.find((t) => t.dueDate)?.dueDate ||
      DEFAULT_DAY_DATES[currentDay] ||
      `${currentDay}, Pekan Berjalan`;
    setFormDueDate(existingDate);

    const initialStates: SubjectFormState[] = daySubjects.map((subjName) => {
      const existing = dayTasks.find((t) => t.subjectName === subjName);
      if (existing) {
        return {
          subjectName: subjName,
          hasTask: true,
          details: existing.details,
          taskType: existing.taskType,
          deadlineTime: existing.deadlineTime,
          submissionMethod: existing.submissionMethod,
        };
      }
      return {
        subjectName: subjName,
        hasTask: false,
        details: "",
        taskType: "PR / Latihan",
        deadlineTime: "23.59 WIB",
        submissionMethod: "MyLms",
      };
    });

    setSubjectStates(initialStates);
  }, [currentDay, tasks]);

  const handleDayTabClick = (day: DayOfWeek) => {
    onSelectDayTab(day);
  };

  const handleToggleSubject = (index: number) => {
    setSubjectStates((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, hasTask: !item.hasTask } : item
      )
    );
  };

  const handleFieldChange = <K extends keyof SubjectFormState>(
    index: number,
    field: K,
    value: SubjectFormState[K]
  ) => {
    setSubjectStates((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleApplyTemplate = (
    index: number,
    templateText: string,
    method?: SubmissionMethod
  ) => {
    setSubjectStates((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            hasTask: true,
            details: item.details
              ? `${item.details}\n${templateText}`
              : templateText,
            submissionMethod: method || item.submissionMethod,
          };
        }
        return item;
      })
    );
  };

  const handleSetAllActive = () => {
    setSubjectStates((prev) =>
      prev.map((item) => ({ ...item, hasTask: true }))
    );
  };

  const handleSetAllNihil = () => {
    setSubjectStates((prev) =>
      prev.map((item) => ({ ...item, hasTask: false }))
    );
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    const tasksToSave: TaskItem[] = [];

    subjectStates.forEach((subj) => {
      if (subj.hasTask && subj.details.trim()) {
        const foundSubj = SUBJECT_SCHEDULES.find((s) => s.name === subj.subjectName);
        tasksToSave.push({
          id: `task-${currentDay.toLowerCase()}-${subj.subjectName.toLowerCase()}-${Date.now()}`,
          subjectId: foundSubj?.id || `sub-${subj.subjectName.toLowerCase()}`,
          subjectName: subj.subjectName,
          day: currentDay,
          dueDate: formDueDate,
          details: subj.details.trim(),
          taskType: subj.taskType,
          deadlineTime: subj.deadlineTime || "23.59 WIB",
          submissionMethod: subj.submissionMethod,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    onSaveDailyTasks(currentDay, formDueDate, tasksToSave);

    setIsSuccessToast(true);
    setTimeout(() => {
      setIsSuccessToast(false);
    }, 2800);
  };

  const activeSubjectsCount = subjectStates.filter((s) => s.hasTask).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 text-gray-900 shadow-none">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <FileText className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              Rekap Laporan Harian (Multi-Mapel)
            </h2>
            <p className="text-xs text-gray-500">
              Input tagihan seluruh 4-5 mapel sekaligus sesuai jadwal resmi XII SIJA 1
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowScheduleModal(!showScheduleModal)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded border border-blue-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{showScheduleModal ? "Tutup Jadwal" : "Lihat Jadwal"}</span>
        </button>
      </div>

      {/* Collapsible Weekly Schedule Card */}
      {showScheduleModal && (
        <div className="mb-4 p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-xs animate-in fade-in duration-150">
          <div className="font-bold text-gray-900 mb-2 flex items-center justify-between">
            <span>📅 Jadwal Pelajaran Mingguan XII SIJA 1:</span>
            <span className="text-[11px] text-gray-500 font-mono">2026/2027</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {Object.entries(WEEKLY_TIMETABLE).map(([day, subjects]) => (
              <div
                key={day}
                className={`p-2 rounded border transition-colors ${
                  day === currentDay
                    ? "bg-blue-50 border-blue-300 ring-1 ring-blue-400"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="font-bold text-blue-600 uppercase text-[11px] border-b border-gray-100 pb-1 mb-1 flex items-center justify-between">
                  <span>{day}</span>
                  {day === currentDay && (
                    <span className="text-[9px] bg-blue-600 text-white px-1 rounded">
                      Aktif
                    </span>
                  )}
                </div>
                <ul className="space-y-0.5 text-[10px] text-gray-700">
                  {subjects.map((subj, idx) => (
                    <li key={idx} className="font-bold truncate">
                      • {subj}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Select Day Tab for Daily Recap */}
      <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            1. Pilih Hari Rekap KBM:
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-600 font-medium">Tanggal:</span>
            <input
              type="text"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
              placeholder="Contoh: Rabu, 26 Agustus 2026"
              className="bg-white border border-gray-300 rounded px-2.5 py-1 text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-600 w-52"
            />
          </div>
        </div>

        {/* Day selection tabs */}
        <div className="grid grid-cols-5 gap-1.5">
          {DAYS.map((day) => {
            const isSelected = day === currentDay;
            const daySubjs = WEEKLY_TIMETABLE[day] || [];
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayTabClick(day)}
                className={`py-2 px-2 rounded text-xs font-bold transition-colors duration-150 text-center cursor-pointer ${
                  isSelected
                    ? "bg-[#2563EB] text-white"
                    : "bg-white hover:bg-gray-200 text-gray-700 border border-gray-200"
                }`}
              >
                <div>{day}</div>
                <div
                  className={`text-[10px] font-normal mt-0.5 ${
                    isSelected ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {daySubjs.length} Mapel
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Batch Controls */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-gray-800">
          <span>Daftar Mapel Hari {currentDay}:</span>
          <span className="bg-blue-100 text-blue-800 text-[11px] px-2 py-0.5 rounded font-mono">
            {activeSubjectsCount} dari {subjectStates.length} Ada Tugas
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={handleSetAllActive}
            className="text-blue-600 hover:text-blue-800 font-semibold px-2 py-0.5 rounded bg-blue-50 border border-blue-200 cursor-pointer"
          >
            Aktifkan Semua
          </button>
          <button
            type="button"
            onClick={handleSetAllNihil}
            className="text-gray-600 hover:text-gray-800 font-medium px-2 py-0.5 rounded bg-gray-100 border border-gray-200 cursor-pointer"
          >
            Set Semua Nihil
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccessToast && (
        <div className="mb-4 p-3 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-medium animate-in fade-in duration-150">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>✓ Laporan rekap hari {currentDay} berhasil disimpan & diperbarui di preview reminder!</span>
        </div>
      )}

      {/* Multi-Subject Form Stack */}
      <form onSubmit={handleSaveAll} className="space-y-3.5">
        {subjectStates.map((subj, index) => {
          return (
            <div
              key={subj.subjectName}
              className={`rounded-lg border transition-all duration-150 p-3.5 sm:p-4 ${
                subj.hasTask
                  ? "bg-white border-blue-300 ring-1 ring-blue-100"
                  : "bg-gray-50/70 border-gray-200 opacity-80"
              }`}
            >
              {/* Card Header: Subject Name & Toggle */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-gray-900 tracking-tight">
                    {subj.subjectName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleSubject(index)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      subj.hasTask
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {subj.hasTask ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Ada Tugas</span>
                      </>
                    ) : (
                      <span>— Nihil (Tidak Ada Tugas)</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Form Inputs (Visible if hasTask is true) */}
              {subj.hasTask ? (
                <div className="mt-3 space-y-3">
                  {/* Rincian Tugas */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Rincian Tugas {subj.subjectName}:
                    </label>
                    <textarea
                      rows={2}
                      value={subj.details}
                      onChange={(e) =>
                        handleFieldChange(index, "details", e.target.value)
                      }
                      placeholder={`Tuliskan instruksi tugas untuk ${subj.subjectName}, link materi, atau soal buku paket...`}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors resize-y font-sans"
                    />

                    {/* Quick helper pills for this subject */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="text-gray-500 font-medium">Template:</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleApplyTemplate(
                            index,
                            "Upload file laporan (format PDF) ke MyLms.",
                            "MyLms"
                          )
                        }
                        className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors font-medium cursor-pointer"
                      >
                        + MyLms PDF
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleApplyTemplate(
                            index,
                            "Kerjakan di buku tulis tugas, kumpulkan di meja guru sebelum KBM.",
                            "Buku Tulis"
                          )
                        }
                        className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 transition-colors font-medium cursor-pointer"
                      >
                        + Buku Tulis
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleApplyTemplate(
                            index,
                            "Mengerjakan latihan soal uji kompetensi Hal. ... No. 1-10.",
                            "Buku Tulis"
                          )
                        }
                        className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 transition-colors font-medium cursor-pointer"
                      >
                        + Latihan Soal
                      </button>
                    </div>
                  </div>

                  {/* Options row: Media, Deadline, Kategori */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                    {/* Media Pengumpulan */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                        Media Pengumpulan
                      </label>
                      <select
                        value={subj.submissionMethod}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "submissionMethod",
                            e.target.value as SubmissionMethod
                          )
                        }
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                      >
                        {SUBMISSION_METHODS.map((m) => (
                          <option key={m} value={m}>
                            {m === "MyLms" ? "🌐 MyLms" : "📖 Buku Tulis"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Batas Waktu / Jam Deadline */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                        Deadline Waktu
                      </label>
                      <input
                        type="text"
                        value={subj.deadlineTime}
                        onChange={(e) =>
                          handleFieldChange(index, "deadlineTime", e.target.value)
                        }
                        placeholder="Contoh: 23.59 WIB, 07.15 WIB"
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Kategori Tagihan */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                        Kategori
                      </label>
                      <select
                        value={subj.taskType}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "taskType",
                            e.target.value as TaskType
                          )
                        }
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                      >
                        {TASK_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-gray-400 italic">
                  Tidak ada tagihan tugas untuk mapel {subj.subjectName} pada hari ini.
                </div>
              )}
            </div>
          );
        })}

        {/* Submit Button to Save All Subjects in 1 Click */}
        <div className="pt-3">
          <button
            type="submit"
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold px-4 py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer shadow-none"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Simpan Rekap Hari {currentDay} ({activeSubjectsCount} Mapel Aktif)</span>
          </button>
          <p className="text-[11px] text-center text-gray-500 mt-2">
            Perubahan langsung memperbarui seluruh format reminder WhatsApp di panel kanan
          </p>
        </div>
      </form>
    </div>
  );
};
