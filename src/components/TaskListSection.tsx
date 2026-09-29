"use client";

import React, { useState } from "react";
import {
  ListFilter,
  CheckCircle2,
  Circle,
  Trash2,
  Clock,
  Calendar,
  Search,
  AlertCircle,
} from "lucide-react";
import { TaskItem, DayOfWeek } from "@/types/task";

interface TaskListSectionProps {
  tasks: TaskItem[];
  onToggleTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectDayFilter: (day: DayOfWeek | "SEMUA") => void;
  activeFilterDay: string;
}

export const TaskListSection: React.FC<TaskListSectionProps> = ({
  tasks,
  onToggleTaskComplete,
  onDeleteTask,
  onSelectDayFilter,
  activeFilterDay,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredTasks = tasks.filter((t) => {
    const matchQuery =
      t.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.dueDate && t.dueDate.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchDay =
      activeFilterDay === "SEMUA" || t.day === activeFilterDay;

    const matchType =
      filterType === "ALL" ||
      (filterType === "PENDING" && !t.isCompleted) ||
      (filterType === "COMPLETED" && t.isCompleted);

    return matchQuery && matchDay && matchType;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 text-gray-900 mt-6 shadow-none">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <ListFilter className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Daftar Seluruh Tugas Terkonsolidasi
            </h3>
            <p className="text-xs text-gray-500">
              Kelola status pengerjaan, deadline, dan hapus tugas yang telah berlalu
            </p>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tugas / mapel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-600 w-44"
            />
          </div>

          {/* Status filter pills */}
          <div className="inline-flex bg-gray-100 p-0.5 rounded border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                filterType === "ALL"
                  ? "bg-white text-gray-900 font-semibold border border-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semua ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("PENDING")}
              className={`px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                filterType === "PENDING"
                  ? "bg-white text-amber-700 font-semibold border border-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Aktif ({tasks.filter((t) => !t.isCompleted).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("COMPLETED")}
              className={`px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                filterType === "COMPLETED"
                  ? "bg-white text-emerald-700 font-semibold border border-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Selesai ({tasks.filter((t) => t.isCompleted).length})
            </button>
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">
            Tidak ada data tugas yang sesuai dengan filter.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Gunakan form di atas untuk menambahkan tugas baru ke jadwal kelas XII SIJA 1.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTasks.map((task) => {
            return (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition-all duration-150 flex flex-col justify-between ${
                  task.isCompleted
                    ? "bg-gray-50/80 border-gray-200 opacity-75"
                    : "bg-white border-gray-200 hover:border-gray-400"
                }`}
              >
                <div>
                  {/* Top Subject Tag & Completion Toggle */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {task.subjectName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {task.taskType}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleTaskComplete(task.id)}
                      title={
                        task.isCompleted
                          ? "Tandai belum selesai"
                          : "Tandai sudah selesai"
                      }
                      className="text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 hover:text-emerald-600" />
                      )}
                    </button>
                  </div>

                  {/* Task Details */}
                  <p
                    className={`text-xs text-gray-800 leading-relaxed font-normal ${
                      task.isCompleted ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {task.details}
                  </p>
                </div>

                {/* Card Meta & Actions Footer */}
                <div className="mt-3.5 pt-2.5 border-t border-gray-100 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      {task.dueDate}
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 font-semibold">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {task.deadlineTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {task.submissionMethod === "MyLms" ? "🌐 MyLms" : "📖 Buku Tulis"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      title="Hapus tugas dari sistem"
                      className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
