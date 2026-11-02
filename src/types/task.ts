export type DayOfWeek = "SENIN" | "SELASA" | "RABU" | "KAMIS" | "JUMAT";

export interface TaskLinkItem {
  id: string;
  label: string; // contoh: "Link Notion"
  url: string;
}

export interface TaskPointItem {
  id: string;
  text: string;
}

export interface SubjectDraft {
  subjectKey: string; // Normalized key (e.g., "KA-2", "MATEMATIKA", "PAAS")
  subjectName: string; // Display name (e.g., "KA - 2", "PAaS")
  points: TaskPointItem[];
  links: TaskLinkItem[];
  /**
   * "ALL" berarti tampil di pertemuan mapel tersebut berikutnya (hari apa saja mapel itu ada).
   * Jika diisi DayOfWeek spesifik, hanya tampil di hari tersebut.
   */
  targetDay: DayOfWeek | "ALL";
  updatedAt: string;
}

export type WeeklyScheduleMap = Record<DayOfWeek, string[]>;

export interface ClassConfig {
  className: string;
  schedule: WeeklyScheduleMap;
}
