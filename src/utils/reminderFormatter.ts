import { DayOfWeek, SubjectDraft, WeeklyScheduleMap } from "@/types/task";
import {
  formatDateUpperIndonesian,
  normalizeSubjectKey,
} from "@/data/mockData";

/**
 * Mengecek apakah sebuah SubjectDraft aktif untuk hari tertentu
 */
export function isSubjectDraftActiveForDay(
  draft: SubjectDraft | undefined,
  day: DayOfWeek
): boolean {
  if (!draft) return false;
  if (draft.targetDay !== "ALL" && draft.targetDay !== day) return false;
  const validPoints = draft.points.filter((p) => p.text.trim().length > 0);
  const validLinks = draft.links.filter((l) => l.url.trim().length > 0);
  return validPoints.length > 0 || validLinks.length > 0;
}

/**
 * Menghasilkan teks reminder WhatsApp sesuai format baku:
 *
 * *❗REMINDER TUGAS HARI SELASA 03 NOVEMBER 2026❗*
 * *===============================================*
 *
 * ○ *B.INDO*
 * - -
 *
 * ○ *MATEMATIKA*
 * - -
 *
 * ○ *KA - 2*
 *     • - Menyelesaikan LKPD Decision Tree
 *
 * ○ *PAaS*
 *    • - Menyelesaikan Tugas Integrasi Frontend + Express + Cloudflare D1 (Minggu ke - 7) lalu di presentasikan ke Pak Novra
 *    • - Link Notion : https://rumbling-tote-100.notion.site/...
 */
export function generateWhatsAppReminder(
  selectedDay: DayOfWeek,
  isoDate: string,
  schedule: WeeklyScheduleMap,
  drafts: Record<string, SubjectDraft>
): string {
  const formattedDate = formatDateUpperIndonesian(isoDate);
  const daySubjects = schedule[selectedDay] || [];

  const headerLine = formattedDate
    ? `*❗REMINDER TUGAS HARI ${selectedDay.toUpperCase()} ${formattedDate}❗*`
    : `*❗REMINDER TUGAS HARI ${selectedDay.toUpperCase()}❗*`;
  const dividerLine = `*===============================================*`;

  if (daySubjects.length === 0) {
    return `${headerLine}\n${dividerLine}\n\n_Belum ada jadwal mata pelajaran di hari ${selectedDay}._`;
  }

  const subjectBlocks = daySubjects.map((subjectName) => {
    const key = normalizeSubjectKey(subjectName);
    const draft = drafts[key];
    const isActive = isSubjectDraftActiveForDay(draft, selectedDay);

    if (!isActive || !draft) {
      return `○ *${subjectName}*\n- -`;
    }

    const lines: string[] = [];
    draft.points.forEach((pt) => {
      const cleaned = pt.text.trim();
      if (cleaned) {
        lines.push(`    • - ${cleaned}`);
      }
    });

    draft.links.forEach((lnk) => {
      const url = lnk.url.trim();
      const label = lnk.label.trim() || "Link";
      if (url) {
        lines.push(`    • - ${label} : ${url}`);
      }
    });

    if (lines.length === 0) {
      return `○ *${subjectName}*\n- -`;
    }

    return `○ *${subjectName}*\n${lines.join("\n")}`;
  });

  return `${headerLine}\n${dividerLine}\n\n${subjectBlocks.join("\n\n")}`;
}
