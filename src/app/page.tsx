"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { TaskFormPanel } from "@/components/TaskFormPanel";
import { ReminderPreviewPanel } from "@/components/ReminderPreviewPanel";
import { TaskListSection } from "@/components/TaskListSection";
import { DayOfWeek, TaskItem } from "@/types/task";
import { INITIAL_TASKS } from "@/data/mockData";
import {
  Sparkles,
  Info,
  CalendarCheck,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

const STORAGE_KEY = "sijasisten_tasks_data_v4";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<string>("Rabu");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTasks(JSON.parse(saved));
      } else {
        setTasks(INITIAL_TASKS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e);
      setTasks(INITIAL_TASKS);
    }
    setIsLoaded(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {
        console.error("Failed to save to localStorage", e);
      }
    }
  }, [tasks, isLoaded]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Batch save / update all tasks for a day (Multi-Subject input)
  const handleSaveDailyTasks = (
    day: DayOfWeek,
    dueDate: string,
    newDailyTasks: TaskItem[]
  ) => {
    setTasks((prev) => {
      // Remove previous tasks of this day
      const otherDayTasks = prev.filter((t) => t.day !== day);
      return [...newDailyTasks, ...otherDayTasks];
    });

    setSelectedDayTab(day);
    showToast(
      `✓ Berhasil menyimpan rekap hari ${day} (${newDailyTasks.length} mapel ada tugas)`
    );
  };

  // Toggle completion
  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      )
    );
    showToast("Status tugas berhasil diperbarui.");
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast("Tugas berhasil dihapus dari jadwal.");
  };

  // Reset to initial mock data
  const handleResetData = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin mengatur ulang data ke daftar tugas bawaan XII SIJA 1?"
      )
    ) {
      setTasks(INITIAL_TASKS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      setSelectedDayTab("Rabu");
      showToast("Data tugas berhasil diatur ulang ke data default.");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-mono text-gray-500">
            Memuat Sistem SIJAsisten...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between">
      <div>
        {/* Navigation & Header */}
        <Header tasks={tasks} onResetData={handleResetData} />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Quick Announcement Bar */}
        <div className="bg-blue-50/70 border-b border-blue-100 py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <span className="font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">
                REKAP HARIAN
              </span>
              <span className="truncate">
                Pilih hari untuk menginput laporan seluruh 4-5 mapel sekaligus sesuai jadwal, lalu salin broadcast reminder ke WhatsApp kelas.
              </span>
            </div>
            <span className="hidden sm:inline-block font-mono text-[11px] text-blue-700">
              XII SIJA 1
            </span>
          </div>
        </div>

        {/* Main Content Dashboard */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Two-Column Grid on Desktop, Stacking on Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Panel Left: Form Rekap Multi-Mapel Harian (Col 6) */}
            <div className="lg:col-span-6">
              <TaskFormPanel
                tasks={tasks}
                onSaveDailyTasks={handleSaveDailyTasks}
                selectedDayTab={selectedDayTab}
                onSelectDayTab={(day) => setSelectedDayTab(day)}
              />
            </div>

            {/* Panel Right: Output Preview Reminder WhatsApp (Col 6) */}
            <div className="lg:col-span-6 sticky top-4">
              <ReminderPreviewPanel
                tasks={tasks}
                selectedDayTab={selectedDayTab}
                onSelectDayTab={(day) => setSelectedDayTab(day)}
              />
            </div>
          </div>

          {/* Full Task Management List Table/Grid */}
          <TaskListSection
            tasks={tasks}
            onToggleTaskComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onSelectDayFilter={(day) => setSelectedDayTab(day)}
            activeFilterDay={selectedDayTab}
          />
        </main>
      </div>

      {/* Clean Footer */}
      <footer className="w-full bg-white border-t border-gray-200 mt-12 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">SIJAsisten v1.0</span>
            <span>•</span>
            <span>Sekretaris Kelas XII SIJA 1</span>
            <span>•</span>
            <span className="text-gray-400">SMK Negeri Jurusan SIJA</span>
          </div>
          <div className="text-[11px] text-gray-400 font-mono">
            Neo-Tech Minimalist Dashboard • Multi-Subject Daily Reminder
          </div>
        </div>
      </footer>
    </div>
  );
}
