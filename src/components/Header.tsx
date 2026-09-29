"use client";

import React from "react";
import { Terminal, Shield, Calendar, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { TaskItem } from "@/types/task";

interface HeaderProps {
  tasks: TaskItem[];
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ tasks, onResetData }) => {
  const pendingCount = tasks.filter((t) => !t.isCompleted).length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#2563EB] flex items-center justify-center text-white shrink-0 shadow-none">
              <Terminal className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 font-sans">
                  SIJAsisten
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  XII SIJA 1
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Hub
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Systems, Information, Jaringan & Aplikasi — Dashboard Konsolidasi Tugas & WhatsApp Reminder
              </p>
            </div>
          </div>

          {/* Quick Metrics & Reset Action */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Live date badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 text-gray-700 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Tahun Ajaran 2026/2027</span>
            </div>

            {/* Pending count badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>
                <strong>{pendingCount}</strong> Menunggu
              </span>
            </div>

            {/* Completed count badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                <strong>{completedCount}</strong> Selesai
              </span>
            </div>

            {/* Reset data button */}
            <button
              type="button"
              onClick={onResetData}
              title="Reset ke data awal tugas XII SIJA 1"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 transition-colors duration-150 active:bg-gray-200 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
