"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, RotateCcw, Save, CalendarCog } from "lucide-react";
import { ClassConfig, DayOfWeek, WeeklyScheduleMap } from "@/types/task";
import { DAYS_OF_WEEK, DEFAULT_CLASS_CONFIG } from "@/data/mockData";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  classConfig: ClassConfig;
  onSaveConfig: (newConfig: ClassConfig) => void;
  onResetToDefaultPreset: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  classConfig,
  onSaveConfig,
  onResetToDefaultPreset,
}) => {
  const [className, setClassName] = useState(classConfig.className);
  const [schedule, setSchedule] = useState<WeeklyScheduleMap>(
    classConfig.schedule
  );
  const [activeDay, setActiveDay] = useState<DayOfWeek>("SENIN");
  const [newSubjectInput, setNewSubjectInput] = useState("");

  if (!isOpen) return null;

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubjectInput.trim();
    if (!trimmed) return;
    setSchedule((prev) => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), trimmed],
    }));
    setNewSubjectInput("");
  };

  const handleUpdateSubject = (day: DayOfWeek, idx: number, val: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].map((s, i) => (i === idx ? val : s)),
    }));
  };

  const handleRemoveSubject = (day: DayOfWeek, idx: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== idx),
    }));
  };

  const handleSave = () => {
    const cleanedSchedule: WeeklyScheduleMap = {
      SENIN: (schedule.SENIN || []).map((s) => s.trim()).filter(Boolean),
      SELASA: (schedule.SELASA || []).map((s) => s.trim()).filter(Boolean),
      RABU: (schedule.RABU || []).map((s) => s.trim()).filter(Boolean),
      KAMIS: (schedule.KAMIS || []).map((s) => s.trim()).filter(Boolean),
      JUMAT: (schedule.JUMAT || []).map((s) => s.trim()).filter(Boolean),
    };
    onSaveConfig({
      className: className.trim() || DEFAULT_CLASS_CONFIG.className,
      schedule: cleanedSchedule,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F3EFE6] neo-card w-full max-w-2xl overflow-hidden my-8">
        {/* Top Hazard Strip */}
        <div className="h-2 w-full bg-hazard-stripes border-b-2 border-[#141413]" />

        {/* Modal Header */}
        <div className="bg-[#C8F560] border-b-2 border-[#141413] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#FFFDF9] border-2 border-[#141413] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#141413] -rotate-2">
              <CalendarCog className="w-5 h-5 text-[#141413] stroke-[2.4]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-[#141413]">
                ATUR JADWAL & IDENTITAS KELAS
              </h2>
              <p className="text-xs font-semibold text-[#141413]/80">
                Sesuaikan nama kelas & daftar mapel harian (tersimpan di browser)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-[#FFFDF9] neo-btn-sm flex items-center justify-center cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Nama Kelas */}
          <div className="bg-[#FFFDF9] p-4 neo-card-sm">
            <label className="block font-mono text-xs font-extrabold uppercase tracking-wider mb-1.5">
              NAMA KELAS (MUNCUL DI HEADER)
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Contoh: XII SIJA 1"
              className="w-full neo-input px-3 py-2 text-sm font-bold"
            />
          </div>

          {/* Pilih Hari untuk Diedit */}
          <div className="bg-[#DDD6FE] p-4 neo-card-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="font-mono text-xs font-extrabold uppercase tracking-wider">
                DAFTAR MAPEL PER HARI (SENIN – JUMAT)
              </span>
              <span className="font-mono text-xs font-bold bg-[#FFFDF9] px-2.5 py-0.5 border-2 border-[#141413] rounded-full">
                {(schedule[activeDay] || []).length} Mapel di Hari {activeDay}
              </span>
            </div>

            {/* Day Tabs */}
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = activeDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    className={`py-2 px-1 text-xs font-extrabold uppercase cursor-pointer neo-btn-sm ${
                      isSelected
                        ? "bg-[#141413] text-[#C8F560]"
                        : "bg-[#FFFDF9] text-[#141413] hover:bg-[#C8F560]"
                    }`}
                  >
                    <div>{day}</div>
                    <div className="font-mono text-[10px] font-bold opacity-80">
                      {(schedule[day] || []).length} mapel
                    </div>
                  </button>
                );
              })}
            </div>

            {/* List of Subjects in Active Day */}
            <div className="space-y-2 mb-3">
              {(schedule[activeDay] || []).length === 0 ? (
                <div className="bg-[#FFFDF9] border-2 border-dashed border-[#141413] rounded-lg p-4 text-center text-xs font-bold text-[#141413]/70">
                  Belum ada mapel untuk hari {activeDay}. Tambahkan di bawah!
                </div>
              ) : (
                (schedule[activeDay] || []).map((subj, idx) => (
                  <div
                    key={`${activeDay}-${idx}`}
                    className="flex items-center gap-2 bg-[#FFFDF9] p-2 border-2 border-[#141413] rounded-lg shadow-[2px_2px_0px_#141413]"
                  >
                    <span className="w-6 h-6 bg-[#C8F560] border-2 border-[#141413] rounded font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={subj}
                      onChange={(e) =>
                        handleUpdateSubject(activeDay, idx, e.target.value)
                      }
                      className="flex-1 bg-transparent text-xs sm:text-sm font-extrabold uppercase focus:outline-none px-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(activeDay, idx)}
                      className="p-1.5 bg-[#F3EFE6] hover:bg-[#FF7A59] border-2 border-[#141413] rounded text-[#141413] cursor-pointer"
                      title="Hapus mapel"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Subject Form */}
            <form onSubmit={handleAddSubject} className="flex gap-2">
              <input
                type="text"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                placeholder={`Tambah mapel baru di hari ${activeDay} (misal: MATEMATIKA)...`}
                className="flex-1 neo-input px-3 py-2 text-xs font-bold"
              />
              <button
                type="submit"
                className="bg-[#FF5A36] text-[#FFFDF9] font-extrabold text-xs px-3.5 py-2 neo-btn-sm flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah</span>
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FFFDF9] border-t-2 border-[#141413] px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              onResetToDefaultPreset();
              onClose();
            }}
            className="bg-[#F3EFE6] hover:bg-[#FF7A59] text-[#141413] font-bold text-xs px-3 py-2 neo-btn-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Reset ke Preset XII SIJA 1</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#F3EFE6] text-[#141413] font-bold text-xs px-3.5 py-2 neo-btn-sm cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-[#C8F560] text-[#141413] font-extrabold text-xs px-4 py-2 neo-btn-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 stroke-[2.4]" />
              <span>Simpan Jadwal Kelas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
