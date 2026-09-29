import { SubjectSchedule, TaskItem, DayOfWeek } from "@/types/task";

export const WEEKLY_TIMETABLE: Record<DayOfWeek, string[]> = {
  Senin: ["PKN-SEJARAH", "KA-2", "S.IOT", "BHS.INGGRIS"],
  Selasa: ["B.INDO", "PABP", "MATEMATIKA", "PAaS"],
  Rabu: ["PEMROGRAMAN 3", "SKJ-2", "BK", "PJOK"],
  Kamis: ["MATEMATIKA", "KIK", "KA-2", "S.IOT", "B.JAWA"],
  Jumat: ["INKUBASI"],
  Sabtu: [],
};

export const DEFAULT_DAY_DATES: Record<DayOfWeek, string> = {
  Senin: "Senin, 31 Agustus 2026",
  Selasa: "Selasa, 1 September 2026",
  Rabu: "Rabu, 26 Agustus 2026",
  Kamis: "Kamis, 27 Agustus 2026",
  Jumat: "Jumat, 28 Agustus 2026",
  Sabtu: "Sabtu, 29 Agustus 2026",
};

export const SUBJECT_SCHEDULES: SubjectSchedule[] = [
  // --- SENIN ---
  {
    id: "sub-pkn-sej",
    name: "PKN-SEJARAH",
    defaultDay: "Senin",
    availableDates: [
      { id: "pkn-d1", day: "Senin", dateFormatted: "Senin, 31 Agustus 2026" },
      { id: "pkn-d2", day: "Senin", dateFormatted: "Senin, 7 September 2026" },
    ],
  },
  {
    id: "sub-ka2",
    name: "KA-2",
    defaultDay: "Kamis",
    availableDates: [
      { id: "ka2-d1", day: "Kamis", dateFormatted: "Kamis, 27 Agustus 2026" },
      { id: "ka2-d2", day: "Senin", dateFormatted: "Senin, 31 Agustus 2026" },
      { id: "ka2-d3", day: "Kamis", dateFormatted: "Kamis, 3 September 2026" },
    ],
  },
  {
    id: "sub-siot",
    name: "S.IOT",
    defaultDay: "Kamis",
    availableDates: [
      { id: "siot-d1", day: "Kamis", dateFormatted: "Kamis, 27 Agustus 2026" },
      { id: "siot-d2", day: "Senin", dateFormatted: "Senin, 31 Agustus 2026" },
      { id: "siot-d3", day: "Kamis", dateFormatted: "Kamis, 3 September 2026" },
    ],
  },
  {
    id: "sub-bhs-inggris",
    name: "BHS.INGGRIS",
    defaultDay: "Senin",
    availableDates: [
      { id: "bing-d1", day: "Senin", dateFormatted: "Senin, 31 Agustus 2026" },
      { id: "bing-d2", day: "Senin", dateFormatted: "Senin, 7 September 2026" },
    ],
  },

  // --- SELASA ---
  {
    id: "sub-bindo",
    name: "B.INDO",
    defaultDay: "Selasa",
    availableDates: [
      { id: "bindo-d1", day: "Selasa", dateFormatted: "Selasa, 1 September 2026" },
      { id: "bindo-d2", day: "Selasa", dateFormatted: "Selasa, 8 September 2026" },
    ],
  },
  {
    id: "sub-pabp",
    name: "PABP",
    defaultDay: "Selasa",
    availableDates: [
      { id: "pabp-d1", day: "Selasa", dateFormatted: "Selasa, 1 September 2026" },
      { id: "pabp-d2", day: "Selasa", dateFormatted: "Selasa, 8 September 2026" },
    ],
  },
  {
    id: "sub-mtk",
    name: "MATEMATIKA",
    defaultDay: "Kamis",
    availableDates: [
      { id: "mtk-d1", day: "Kamis", dateFormatted: "Kamis, 27 Agustus 2026" },
      { id: "mtk-d2", day: "Selasa", dateFormatted: "Selasa, 1 September 2026" },
      { id: "mtk-d3", day: "Kamis", dateFormatted: "Kamis, 3 September 2026" },
    ],
  },
  {
    id: "sub-paas",
    name: "PAaS",
    defaultDay: "Selasa",
    availableDates: [
      { id: "paas-d1", day: "Selasa", dateFormatted: "Selasa, 1 September 2026" },
      { id: "paas-d2", day: "Selasa", dateFormatted: "Selasa, 8 September 2026" },
    ],
  },

  // --- RABU ---
  {
    id: "sub-pem3",
    name: "PEMROGRAMAN 3",
    defaultDay: "Rabu",
    availableDates: [
      { id: "pem3-d1", day: "Rabu", dateFormatted: "Rabu, 26 Agustus 2026" },
      { id: "pem3-d2", day: "Rabu", dateFormatted: "Rabu, 2 September 2026" },
    ],
  },
  {
    id: "sub-skj2",
    name: "SKJ-2",
    defaultDay: "Rabu",
    availableDates: [
      { id: "skj2-d1", day: "Rabu", dateFormatted: "Rabu, 26 Agustus 2026" },
      { id: "skj2-d2", day: "Rabu", dateFormatted: "Rabu, 2 September 2026" },
    ],
  },
  {
    id: "sub-bk",
    name: "BK",
    defaultDay: "Rabu",
    availableDates: [
      { id: "bk-d1", day: "Rabu", dateFormatted: "Rabu, 26 Agustus 2026" },
      { id: "bk-d2", day: "Rabu", dateFormatted: "Rabu, 2 September 2026" },
    ],
  },
  {
    id: "sub-pjok",
    name: "PJOK",
    defaultDay: "Rabu",
    availableDates: [
      { id: "pjok-d1", day: "Rabu", dateFormatted: "Rabu, 26 Agustus 2026" },
      { id: "pjok-d2", day: "Rabu", dateFormatted: "Rabu, 2 September 2026" },
    ],
  },

  // --- KAMIS ---
  {
    id: "sub-kik",
    name: "KIK",
    defaultDay: "Kamis",
    availableDates: [
      { id: "kik-d1", day: "Kamis", dateFormatted: "Kamis, 27 Agustus 2026" },
      { id: "kik-d2", day: "Kamis", dateFormatted: "Kamis, 3 September 2026" },
    ],
  },
  {
    id: "sub-bjawa",
    name: "B.JAWA",
    defaultDay: "Kamis",
    availableDates: [
      { id: "bjawa-d1", day: "Kamis", dateFormatted: "Kamis, 27 Agustus 2026" },
      { id: "bjawa-d2", day: "Kamis", dateFormatted: "Kamis, 3 September 2026" },
    ],
  },

  // --- JUMAT ---
  {
    id: "sub-inkubasi",
    name: "INKUBASI",
    defaultDay: "Jumat",
    availableDates: [
      { id: "ink-d1", day: "Jumat", dateFormatted: "Jumat, 28 Agustus 2026" },
      { id: "ink-d2", day: "Jumat", dateFormatted: "Jumat, 4 September 2026" },
    ],
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  // --- RABU (PEMROGRAMAN 3, SKJ-2, BK, PJOK) ---
  {
    id: "task-rabu-pem3",
    subjectId: "sub-pem3",
    subjectName: "PEMROGRAMAN 3",
    day: "Rabu",
    dueDate: "Rabu, 26 Agustus 2026",
    details: "Upload dokumen API endpoint dan file source code modul autentikasi JWT ke MyLms.",
    taskType: "Praktikum Lab",
    deadlineTime: "23.59 WIB",
    submissionMethod: "MyLms",
    isCompleted: false,
    createdAt: "2026-08-25T10:00:00Z",
  },
  {
    id: "task-rabu-skj2",
    subjectId: "sub-skj2",
    subjectName: "SKJ-2",
    day: "Rabu",
    dueDate: "Rabu, 26 Agustus 2026",
    details: "Laporan konfigurasi dynamic routing OSPF Multi-Area Packet Tracer (format PDF di MyLms).",
    taskType: "Praktikum Lab",
    deadlineTime: "23.59 WIB",
    submissionMethod: "MyLms",
    isCompleted: false,
    createdAt: "2026-08-25T10:30:00Z",
  },
  {
    id: "task-rabu-bk",
    subjectId: "sub-bk",
    subjectName: "BK",
    day: "Rabu",
    dueDate: "Rabu, 26 Agustus 2026",
    details: "Mencatat lembar refleksi pemetaan minat karir industri IT di buku catatan.",
    taskType: "Tugas Individu",
    deadlineTime: "Jam Pelajaran",
    submissionMethod: "Buku Tulis",
    isCompleted: false,
    createdAt: "2026-08-25T11:00:00Z",
  },
  {
    id: "task-rabu-pjok",
    subjectId: "sub-pjok",
    subjectName: "PJOK",
    day: "Rabu",
    dueDate: "Rabu, 26 Agustus 2026",
    details: "Membawa seragam olahraga lengkap dan tugas ringkasan kebugaran jasmani di buku tulis.",
    taskType: "PR / Latihan",
    deadlineTime: "07.15 WIB",
    submissionMethod: "Buku Tulis",
    isCompleted: false,
    createdAt: "2026-08-25T11:30:00Z",
  },

  // --- KAMIS (MATEMATIKA, KIK, KA-2, S.IOT, B.JAWA) ---
  {
    id: "task-kamis-mtk",
    subjectId: "sub-mtk",
    subjectName: "MATEMATIKA",
    day: "Kamis",
    dueDate: "Kamis, 27 Agustus 2026",
    details: "Mengerjakan Latihan Uji Kompetensi Hal. 52 No. 1 - 10 di buku tugas.",
    taskType: "PR / Latihan",
    deadlineTime: "07.15 WIB (Sebelum KBM)",
    submissionMethod: "Buku Tulis",
    isCompleted: false,
    createdAt: "2026-08-25T14:30:00Z",
  },
  {
    id: "task-kamis-kik",
    subjectId: "sub-kik",
    subjectName: "KIK",
    day: "Kamis",
    dueDate: "Kamis, 27 Agustus 2026",
    details: "Membuat ringkasan SOP industri IT dan komunikasi kerja di buku catatan.",
    taskType: "Tugas Individu",
    deadlineTime: "Jam Pelajaran",
    submissionMethod: "Buku Tulis",
    isCompleted: false,
    createdAt: "2026-08-25T14:45:00Z",
  },
  {
    id: "task-kamis-ka2",
    subjectId: "sub-ka2",
    subjectName: "KA-2",
    day: "Kamis",
    dueDate: "Kamis, 27 Agustus 2026",
    details: "Upload laporan praktikum SQL Injection dan mitigasi prepared statements (PDF) ke MyLms.",
    taskType: "Praktikum Lab",
    deadlineTime: "23.59 WIB",
    submissionMethod: "MyLms",
    isCompleted: false,
    createdAt: "2026-08-25T15:00:00Z",
  },
  {
    id: "task-kamis-siot",
    subjectId: "sub-siot",
    subjectName: "S.IOT",
    day: "Kamis",
    dueDate: "Kamis, 27 Agustus 2026",
    details: "Submit jobsheet sensor ESP32 telemetry dan screenshot serial monitor ke MyLms.",
    taskType: "Praktikum Lab",
    deadlineTime: "23.59 WIB",
    submissionMethod: "MyLms",
    isCompleted: false,
    createdAt: "2026-08-25T16:20:00Z",
  },
  {
    id: "task-kamis-bjawa",
    subjectId: "sub-bjawa",
    subjectName: "B.JAWA",
    day: "Kamis",
    dueDate: "Kamis, 27 Agustus 2026",
    details: "Nulis 2 pada tembang Kinanthi lan tegesipun ing buku tugas.",
    taskType: "Tugas Individu",
    deadlineTime: "Jam Pelajaran",
    submissionMethod: "Buku Tulis",
    isCompleted: false,
    createdAt: "2026-08-25T16:45:00Z",
  },
];
