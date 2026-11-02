import {
  ClassConfig,
  DayOfWeek,
  ScheduleBackupPayload,
  SubjectDraft,
  WeeklyScheduleMap,
} from "@/types/task";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "SENIN",
  "SELASA",
  "RABU",
  "KAMIS",
  "JUMAT",
];

/**
 * Daftar Mapel Umum Sekolah Indonesia (SMA / SMK / MA)
 */
export const COMMON_SCHOOL_SUBJECTS: string[] = [
  "MATEMATIKA",
  "B.INDO",
  "BHS.INGGRIS",
  "PABP",
  "PKN",
  "SEJARAH",
  "PKN-SEJARAH",
  "PJOK",
  "BK",
  "SENI BUDAYA",
  "INFORMATIKA",
  "B.JAWA",
  "BAHASA DAERAH",
  "KWU / PKK",
  "FISIKA",
  "KIMIA",
  "BIOLOGI",
  "EKONOMI",
  "SOSIOLOGI",
  "GEOGRAFI",
];

/**
 * Mapel khusus bawaan preset XII SIJA 1
 */
export const DEFAULT_SIJA_CUSTOM_SUBJECTS: string[] = [
  "KA-2",
  "KA - 2",
  "S.IOT",
  "PAaS",
  "PEMOGRAMAN 3",
  "SKJ-2",
  "KIK",
  "INKUBASI",
];

export const EMPTY_WEEKLY_SCHEDULE: WeeklyScheduleMap = {
  SENIN: [],
  SELASA: [],
  RABU: [],
  KAMIS: [],
  JUMAT: [],
};

export const EMPTY_CLASS_CONFIG: ClassConfig = {
  className: "",
  schedule: EMPTY_WEEKLY_SCHEDULE,
};

export const DEFAULT_WEEKLY_SCHEDULE: WeeklyScheduleMap = {
  SENIN: ["PKN-SEJARAH", "KA-2", "S.IOT", "BHS.INGGRIS"],
  SELASA: ["B.INDO", "MATEMATIKA", "KA - 2", "PAaS"],
  RABU: ["PEMOGRAMAN 3", "SKJ-2", "BK", "PJOK"],
  KAMIS: ["MATEMATIKA", "KIK", "PABP", "S.IOT", "B.JAWA"],
  JUMAT: ["INKUBASI"],
};

export const DEFAULT_CLASS_CONFIG: ClassConfig = {
  className: "XII SIJA 1",
  schedule: DEFAULT_WEEKLY_SCHEDULE,
};

export const GENERAL_SMA_SCHEDULE: WeeklyScheduleMap = {
  SENIN: ["PKN", "MATEMATIKA", "B.INDO", "BHS.INGGRIS"],
  SELASA: ["FISIKA", "KIMIA", "BIOLOGI", "SEJARAH"],
  RABU: ["MATEMATIKA", "INFORMATIKA", "SENI BUDAYA", "PJOK"],
  KAMIS: ["PABP", "EKONOMI", "SOSIOLOGI", "B.JAWA"],
  JUMAT: ["BK", "KWU / PKK"],
};

export const GENERAL_SMA_CLASS_CONFIG: ClassConfig = {
  className: "XI MIPA 1",
  schedule: GENERAL_SMA_SCHEDULE,
};

/**
 * Encode jadwal & mapel custom menjadi string kode ringkas (URL-safe Base64)
 */
export function encodeScheduleBackup(payload: ScheduleBackupPayload): string {
  try {
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch (e) {
    console.error("Gagal membuat kode cadangan jadwal:", e);
    return "";
  }
}

/**
 * Decode string kode cadangan menjadi ScheduleBackupPayload yang tervalidasi
 */
export function decodeScheduleBackup(
  code: string
): ScheduleBackupPayload | null {
  try {
    let cleaned = code.trim();
    // Jika user menempelkan URL penuh (?jadwal=...), ekstrak parameternya otomatis
    if (cleaned.includes("jadwal=")) {
      const urlParts = cleaned.split("jadwal=");
      cleaned = urlParts[urlParts.length - 1].split("&")[0];
    }
    const base64 = cleaned.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as ScheduleBackupPayload;

    if (
      !parsed ||
      typeof parsed.className !== "string" ||
      !parsed.schedule ||
      typeof parsed.schedule !== "object"
    ) {
      return null;
    }

    const dedupeDayList = (arr: unknown): string[] => {
      if (!Array.isArray(arr)) return [];
      const seen = new Set<string>();
      const result: string[] = [];
      for (const item of arr) {
        const trimmed = String(item).trim();
        if (!trimmed) continue;
        const key = normalizeSubjectKey(trimmed);
        if (!seen.has(key)) {
          seen.add(key);
          result.push(trimmed);
        }
      }
      return result;
    };

    const validSchedule: WeeklyScheduleMap = {
      SENIN: dedupeDayList(parsed.schedule.SENIN),
      SELASA: dedupeDayList(parsed.schedule.SELASA),
      RABU: dedupeDayList(parsed.schedule.RABU),
      KAMIS: dedupeDayList(parsed.schedule.KAMIS),
      JUMAT: dedupeDayList(parsed.schedule.JUMAT),
    };

    const totalSubjects = DAYS_OF_WEEK.reduce(
      (acc, d) => acc + validSchedule[d].length,
      0
    );
    const cleanedClassName = parsed.className.trim();
    if (!cleanedClassName || totalSubjects === 0) {
      return null;
    }

    const customSubjects = Array.isArray(parsed.customSubjects)
      ? parsed.customSubjects.map((s) => String(s).trim()).filter(Boolean)
      : [];

    return {
      v: 1,
      className: cleanedClassName,
      schedule: validSchedule,
      customSubjects,
    };
  } catch {
    return null;
  }
}

/**
 * Normalisasi nama mapel menjadi key unik (contoh: "KA - 2" dan "KA-2" -> "KA-2")
 */
export function normalizeSubjectKey(name: string): string {
  return name
    .trim()
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .toUpperCase();
}

/**
 * Mencari daftar hari di mana suatu mapel dijadwalkan
 */
export function getDaysForSubject(
  subjectName: string,
  schedule: WeeklyScheduleMap
): DayOfWeek[] {
  const key = normalizeSubjectKey(subjectName);
  return DAYS_OF_WEEK.filter((day) =>
    (schedule[day] || []).some((s) => normalizeSubjectKey(s) === key)
  );
}

/**
 * Preset awal draft tugas sesuai contoh referensi XII SIJA 1
 */
export const INITIAL_SUBJECT_DRAFTS: Record<string, SubjectDraft> = {
  "KA-2": {
    subjectKey: "KA-2",
    subjectName: "KA - 2",
    points: [
      {
        id: "pt-ka2-1",
        text: "Menyelesaikan LKPD Decision Tree",
      },
    ],
    links: [],
    targetDay: "ALL",
    updatedAt: "2026-11-02T18:00:00.000Z",
  },
  PAAS: {
    subjectKey: "PAAS",
    subjectName: "PAaS",
    points: [
      {
        id: "pt-paas-1",
        text: "Menyelesaikan Tugas Integrasi Frontend + Express + Cloudflare D1 (Minggu ke - 7) lalu di presentasikan ke Pak Novra",
      },
    ],
    links: [
      {
        id: "lnk-paas-1",
        label: "Link Notion",
        url: "https://rumbling-tote-100.notion.site/Platform-as-a-Service-PaaS-26-27-3db22cfd33d28044a2fcd8613e0809ba?p=3f722cfd33d281698e7ee3d71d36d5cf&pm=s",
      },
    ],
    targetDay: "ALL",
    updatedAt: "2026-11-02T18:00:00.000Z",
  },
};

const INDONESIAN_MONTHS = [
  "JANUARI",
  "FEBRUARI",
  "MARET",
  "APRIL",
  "MEI",
  "JUNI",
  "JULI",
  "AGUSTUS",
  "SEPTEMBER",
  "OKTOBER",
  "NOVEMBER",
  "DESEMBER",
];

export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Menghitung Hari Besok secara cerdas:
 * - Senin (1) -> Selasa (+1)
 * - Selasa (2) -> Rabu (+1)
 * - Rabu (3) -> Kamis (+1)
 * - Kamis (4) -> Jumat (+1)
 * - Jumat (5) -> Senin minggu depan (+3)
 * - Sabtu (6) -> Senin minggu depan (+2)
 * - Minggu (0) -> Senin besok (+1)
 */
export function getSmartTargetDayAndDate(now: Date = new Date()): {
  day: DayOfWeek;
  isoDate: string;
} {
  const currentDayIndex = now.getDay();
  const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (currentDayIndex === 5) {
    targetDate.setDate(targetDate.getDate() + 3);
    return { day: "SENIN", isoDate: toLocalIsoDate(targetDate) };
  }
  if (currentDayIndex === 6) {
    targetDate.setDate(targetDate.getDate() + 2);
    return { day: "SENIN", isoDate: toLocalIsoDate(targetDate) };
  }
  if (currentDayIndex === 0) {
    targetDate.setDate(targetDate.getDate() + 1);
    return { day: "SENIN", isoDate: toLocalIsoDate(targetDate) };
  }

  targetDate.setDate(targetDate.getDate() + 1);
  const mapIndexToDay: Record<number, DayOfWeek> = {
    1: "SENIN",
    2: "SELASA",
    3: "RABU",
    4: "KAMIS",
    5: "JUMAT",
  };
  const nextDay = mapIndexToDay[targetDate.getDay()] || "SENIN";
  return { day: nextDay, isoDate: toLocalIsoDate(targetDate) };
}

/**
 * Ketika user klik tab hari tertentu (SENIN..JUMAT), cari tanggal terdekat untuk hari tersebut
 */
export function getUpcomingDateForDay(
  targetDay: DayOfWeek,
  now: Date = new Date()
): string {
  const dayToJsIndex: Record<DayOfWeek, number> = {
    SENIN: 1,
    SELASA: 2,
    RABU: 3,
    KAMIS: 4,
    JUMAT: 5,
  };
  const targetIdx = dayToJsIndex[targetDay];
  const currentIdx = now.getDay();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let diff = targetIdx - currentIdx;
  if (diff <= 0) {
    diff += 7;
  }
  date.setDate(date.getDate() + diff);
  return toLocalIsoDate(date);
}

/**
 * Format YYYY-MM-DD menjadi "03 NOVEMBER 2026"
 */
export function formatDateUpperIndonesian(isoDate: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate.toUpperCase();
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2].padStart(2, "0");
  const monthName = INDONESIAN_MONTHS[monthIdx] || "";
  if (!monthName || isNaN(year)) return isoDate.toUpperCase();
  return `${day} ${monthName} ${year}`;
}

/**
 * Mengonversi tanggal YYYY-MM-DD ke DayOfWeek (SENIN..JUMAT) atau "WEEKEND" jika Sabtu/Minggu
 */
export function getDayOfWeekFromIsoDate(
  isoDate: string
): DayOfWeek | "WEEKEND" | null {
  if (!isoDate) return null;
  const parts = isoDate.split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  const dateObj = new Date(y, m, d);
  const dayIdx = dateObj.getDay();
  const mapIndexToDay: Record<number, DayOfWeek> = {
    1: "SENIN",
    2: "SELASA",
    3: "RABU",
    4: "KAMIS",
    5: "JUMAT",
  };
  if (dayIdx === 0 || dayIdx === 6) return "WEEKEND";
  return mapIndexToDay[dayIdx] || null;
}
