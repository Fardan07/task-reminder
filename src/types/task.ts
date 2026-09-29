export type DayOfWeek =
  | "Senin"
  | "Selasa"
  | "Rabu"
  | "Kamis"
  | "Jumat"
  | "Sabtu";

export type TaskType =
  | "PR / Latihan"
  | "Tugas Individu"
  | "Tugas Kelompok"
  | "Praktikum Lab"
  | "Ulangan / Kuis";

export type SubmissionMethod = "MyLms" | "Buku Tulis";

export interface SubjectSchedule {
  id: string;
  name: string; // ONLY abbreviation: e.g. "KA-2", "S.IOT", "MATEMATIKA"
  defaultDay: DayOfWeek;
  availableDates: {
    id: string;
    day: DayOfWeek;
    dateFormatted: string; // e.g. "Kamis, 27 Agustus 2026"
  }[];
}

export interface TaskItem {
  id: string;
  subjectId: string;
  subjectName: string; // ONLY abbreviation: e.g. "KA-2"
  day: DayOfWeek;
  dueDate: string;     // e.g. "Kamis, 27 Agustus 2026"
  details: string;     // Detailed task content
  taskType: TaskType;
  deadlineTime: string;// e.g. "23.59 WIB" or "07.15 WIB"
  submissionMethod: SubmissionMethod;
  isCompleted: boolean;
  createdAt: string;
}

export type ReminderFormatStyle = "standard" | "compact" | "formal";
