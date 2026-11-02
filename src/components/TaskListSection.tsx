"use client";

import React from "react";
import { CalendarDays, CheckCircle2, ArrowRight, CalendarCog } from "lucide-react";
import { DayOfWeek, SubjectDraft, WeeklyScheduleMap } from "@/types/task";
import { DAYS_OF_WEEK, normalizeSubjectKey } from "@/data/mockData";
import { isSubjectDraftActiveForDay } from "@/utils/reminderFormatter";

interface TaskListSectionProps {
  schedule: WeeklyScheduleMap;
  drafts: Record<string, SubjectDraft>;
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  onClearSubjectDraft: (subjectName: string) => void;
  onOpenScheduleModal: () => void;
}

const DAY_HEADER_COLORS: Record<DayOfWeek, string> = {
  SENIN: "bg-[#C8F560]",
  SELASA: "bg-[#FF7A59]",
  RABU: "bg-[#C4B5FD]",
  KAMIS: "bg-[#7DD3FC]",
  JUMAT: "bg-[#D1FAE5]",
};

export const TaskListSection: React.FC<TaskListSectionProps> = ({
  schedule,
  drafts,
  selectedDay,
  onSelectDay,
  onClearSubjectDraft,
  onOpenScheduleModal,
}) => {
  return (
    <section className="mt-8 bg-[#FFFDF9] neo-card overflow-hidden">
      <div className="h-2 w-full bg-hazard-stripes border-b-2 border-[#141413]" />

      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-5 border-b-2 border-[#141413]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#DDD6FE] border-2 border-[#141413] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#141413] shrink-0 -rotate-2">
              <CalendarDays className="w-5 h-5 text-[#141413] stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-[#141413]">
                  PAPAN JADWAL & STATUS TUGAS SEPEKAN
                </h3>
                <span className="font-mono text-xs font-bold text-[#FF5A36]">
                  ✦
                </span>
              </div>
              <p className="text-xs font-medium text-[#141413]/75">
                Klik kartu hari untuk berpindah cepat atau reset mapel yang sudah selesai
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenScheduleModal}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 bg-[#F3EFE6] hover:bg-[#C8F560] border-2 border-[#141413] rounded-full shadow-[2px_2px_0px_#141413] self-start sm:self-auto cursor-pointer transition-colors"
          >
            <CalendarCog className="w-3.5 h-3.5 stroke-[2.4]" />
            <span>Ubah Susunan Jadwal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = day === selectedDay;
            const subjects = schedule[day] || [];
            const activeCount = subjects.filter((s) =>
              isSubjectDraftActiveForDay(drafts[normalizeSubjectKey(s)], day)
            ).length;
            const headerAccent = DAY_HEADER_COLORS[day];

            return (
              <div
                key={day}
                className={`neo-card-sm overflow-hidden flex flex-col justify-between ${
                  isSelected ? "bg-[#F3EFE6] ring-2 ring-[#141413]" : "bg-[#FFFDF9]"
                }`}
              >
                <div>
                  <div
                    className={`${headerAccent} px-3.5 py-2.5 border-b-2 border-[#141413] flex items-center justify-between gap-1`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectDay(day)}
                      className="text-sm font-extrabold uppercase tracking-tight flex items-center gap-1 text-[#141413] hover:underline cursor-pointer"
                    >
                      <span>{day}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <span className="font-mono text-[10px] font-extrabold bg-[#FFFDF9] text-[#141413] px-2 py-0.5 border border-[#141413] rounded-full">
                      {activeCount}/{subjects.length}
                    </span>
                  </div>

                  <ul className="p-3 space-y-1.5">
                    {subjects.length === 0 ? (
                      <li className="px-2.5 py-4 border-2 border-dashed border-[#141413]/30 rounded-lg text-center text-xs font-semibold text-[#141413]/60">
                        Tidak ada jadwal mapel
                      </li>
                    ) : (
                      subjects.map((subj, idx) => {
                        const key = normalizeSubjectKey(subj);
                        const draft = drafts[key];
                        const hasTask = isSubjectDraftActiveForDay(draft, day);

                        return (
                          <li
                            key={`${day}-${subj}-${idx}`}
                            className={`px-2.5 py-1.5 border-2 border-[#141413] rounded-lg text-xs flex items-center justify-between gap-1.5 ${
                              hasTask
                                ? "bg-[#C8F560] font-extrabold shadow-[2px_2px_0px_#141413]"
                                : "bg-[#FFFDF9] font-semibold text-[#141413]/70"
                            }`}
                          >
                            <span className="truncate">{subj}</span>
                            {hasTask ? (
                              <button
                                type="button"
                                onClick={() => onClearSubjectDraft(subj)}
                                title="Selesai / Kosongkan tugas mapel ini"
                                className="px-1.5 py-0.5 bg-[#FFFDF9] hover:bg-[#FF7A59] border border-[#141413] rounded font-mono text-[10px] font-extrabold text-[#141413] cursor-pointer shrink-0 flex items-center gap-0.5"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 stroke-[2.5]" />
                                <span>Reset</span>
                              </button>
                            ) : (
                              <span className="font-mono text-[10px] font-bold text-[#141413]/50 shrink-0">
                                - -
                              </span>
                            )}
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>

                <div className="px-3 pb-3">
                  <button
                    type="button"
                    onClick={() => onSelectDay(day)}
                    className={`w-full py-1.5 border-2 border-[#141413] rounded-lg text-[11px] font-extrabold uppercase cursor-pointer shadow-[2px_2px_0px_#141413] ${
                      isSelected
                        ? "bg-[#141413] text-[#C8F560]"
                        : "bg-[#FFFDF9] hover:bg-[#DDD6FE] text-[#141413]"
                    }`}
                  >
                    {isSelected ? "✦ SEDANG DIBUKA" : `BUKA HARI ${day}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
