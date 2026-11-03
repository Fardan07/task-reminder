import {
  DayOfWeek,
  ReminderTemplateStyle,
  SubjectDraft,
  WeeklyScheduleMap,
} from "@/types/task";
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
 * Helper untuk normalisasi teks agar tidak ada spasi ganda dan trim
 */
function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Menghasilkan teks reminder WhatsApp sesuai format baku:
 *
 * A. Gaya Klasik:
 * *❗REMINDER TUGAS HARI SELASA❗*
 * *📅 03 NOVEMBER 2026*
 * *============================*
 *
 * ○ *B.INDO*
 * - -
 *
 * ○ *KA - 2*
 *    • - Menyelesaikan LKPD Decision Tree
 *
 * ○ *PAaS*
 *    • - Menyelesaikan Tugas Integrasi Frontend
 *    • - *Link Notion :*
 *      https://...
 *
 * B. Gaya Modern:
 * 📌 *REMINDER TUGAS — XII SIJA 1*
 * 🗓️ *SELASA, 03 NOVEMBER 2026*
 * ────────────────────────────
 *
 * 🔹 *PAaS*
 * • Menyelesaikan Tugas Integrasi Frontend
 * 🔗 *Link Notion:*
 * https://...
 *
 * 🔸 *B.INDO*
 * _Tidak ada tugas (- -)_
 */
export function generateWhatsAppReminder(
  selectedDay: DayOfWeek,
  isoDate: string,
  schedule: WeeklyScheduleMap,
  drafts: Record<string, SubjectDraft>,
  style: ReminderTemplateStyle = "KLASIK",
  classNameLabel = "KELAS KITA"
): string {
  const formattedDate = formatDateUpperIndonesian(isoDate);
  const daySubjects = schedule[selectedDay] || [];
  const cleanClassName = normalizeSpaces(classNameLabel) || "KELAS KITA";

  // 1. GENERATE HEADER & DIVIDER (Maksimal 28 karakter agar tidak wrap di HP)
  let headerBlock = "";
  if (style === "MODERN") {
    const classHeader = `📌 *REMINDER TUGAS — ${cleanClassName.toUpperCase()}*`;
    const dateHeader = formattedDate
      ? `🗓️ *${selectedDay.toUpperCase()}, ${formattedDate}*`
      : `🗓️ *${selectedDay.toUpperCase()}*`;
    const dividerLine = "─".repeat(28);
    headerBlock = `${classHeader}\n${dateHeader}\n${dividerLine}`;
  } else {
    // KLASIK
    const titleHeader = `*❗REMINDER TUGAS HARI ${selectedDay.toUpperCase()}❗*`;
    const dateHeader = formattedDate ? `*📅 ${formattedDate}*` : "";
    const dividerLine = "*============================*"; // Tepat 28 karakter
    headerBlock = dateHeader
      ? `${titleHeader}\n${dateHeader}\n${dividerLine}`
      : `${titleHeader}\n${dividerLine}`;
  }

  // 2. EMPTY SCHEDULE HANDLER
  if (daySubjects.length === 0) {
    return `${headerBlock}\n\n_Belum ada jadwal mata pelajaran di hari ${selectedDay}._`;
  }

  // 3. GENERATE SUBJECT BLOCKS
  const subjectBlocks = daySubjects.map((subjectName) => {
    const key = normalizeSubjectKey(subjectName);
    const draft = drafts[key];
    const isActive = isSubjectDraftActiveForDay(draft, selectedDay);

    if (style === "MODERN") {
      if (!isActive || !draft) {
        return `🔸 *${subjectName}*\n_Tidak ada tugas (- -)_`;
      }

      const lines: string[] = [];
      draft.points.forEach((pt) => {
        const cleaned = normalizeSpaces(pt.text);
        if (cleaned) {
          lines.push(`• ${cleaned}`);
        }
      });

      draft.links.forEach((lnk) => {
        const url = lnk.url.trim();
        const label = normalizeSpaces(lnk.label) || "Link";
        if (url) {
          lines.push(`🔗 *${label}:*\n${url}`);
        }
      });

      if (lines.length === 0) {
        return `🔸 *${subjectName}*\n_Tidak ada tugas (- -)_`;
      }

      return `🔹 *${subjectName}*\n${lines.join("\n")}`;
    } else {
      // KLASIK
      if (!isActive || !draft) {
        return `○ *${subjectName}*\n- -`;
      }

      const lines: string[] = [];
      draft.points.forEach((pt) => {
        const cleaned = normalizeSpaces(pt.text);
        if (cleaned) {
          lines.push(`   • - ${cleaned}`);
        }
      });

      draft.links.forEach((lnk) => {
        const url = lnk.url.trim();
        const label = normalizeSpaces(lnk.label) || "Link";
        if (url) {
          // Format rapi link WhatsApp: label di atas, URL di baris baru berindentasi
          lines.push(`   • - *${label} :*\n     ${url}`);
        }
      });

      if (lines.length === 0) {
        return `○ *${subjectName}*\n- -`;
      }

      return `○ *${subjectName}*\n${lines.join("\n")}`;
    }
  });

  return `${headerBlock}\n\n${subjectBlocks.join("\n\n")}`;
}
