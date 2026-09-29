import { TaskItem, ReminderFormatStyle } from "@/types/task";

export function generateWhatsAppReminder(
  tasks: TaskItem[],
  selectedDay: string,
  selectedDate: string,
  style: ReminderFormatStyle = "standard",
  includeCompleted: boolean = false
): string {
  const activeTasks = includeCompleted
    ? tasks
    : tasks.filter((t) => !t.isCompleted);

  if (activeTasks.length === 0) {
    return `❗ *REMINDER TUGAS HARI ${selectedDay.toUpperCase()}* ❗\n` +
      `📅 *Tanggal:* ${selectedDate || "Semua Tanggal"}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎉 *Tidak ada tagihan tugas aktif untuk hari ini!*\n` +
      `Selamat beristirahat atau gunakan waktu untuk review materi. ✨\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `— *Sekretaris Kelas XII SIJA 1* • _SIJAsisten_`;
  }

  // Group tasks by subject
  const tasksBySubject: Record<string, TaskItem[]> = {};
  activeTasks.forEach((task) => {
    const key = task.subjectName;
    if (!tasksBySubject[key]) {
      tasksBySubject[key] = [];
    }
    tasksBySubject[key].push(task);
  });

  const subjectNames = Object.keys(tasksBySubject);

  if (style === "compact") {
    let output = `⚡ *REMINDER TUGAS: ${selectedDay.toUpperCase()} (${selectedDate})* ⚡\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━\n`;
    subjectNames.forEach((subj, idx) => {
      output += `\n*${idx + 1}. ${subj.toUpperCase()}*\n`;
      tasksBySubject[subj].forEach((t) => {
        output += `  ▪ ${t.details}\n`;
        output += `    🕒 _Deadline:_ ${t.deadlineTime} (${t.submissionMethod})\n`;
      });
    });
    output += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `⚠️ _Total ${activeTasks.length} tugas. Jangan sampai terlambat kumpul!_\n`;
    output += `— *XII SIJA 1*`;
    return output;
  }

  if (style === "formal") {
    let output = `📢 *PEMBERITAHUAN TUGAS KELAS XII SIJA 1*\n`;
    output += `Hari/Tanggal : ${selectedDate || selectedDay}\n`;
    output += `Status       : ${activeTasks.length} Tugas Perlu Diselesaikan\n`;
    output += `═══════════════════════════════════\n\n`;

    subjectNames.forEach((subj) => {
      output += `【 *${subj.toUpperCase()}* 】\n`;
      tasksBySubject[subj].forEach((t, i) => {
        output += `  ${i + 1}. *Tipe:* ${t.taskType}\n`;
        output += `     *Batas Waktu:* ${t.deadlineTime}\n`;
        output += `     *Media Pengumpulan:* ${t.submissionMethod}\n`;
        output += `     *Deskripsi Tugas:*\n     "${t.details}"\n\n`;
      });
    });

    output += `═══════════════════════════════════\n`;
    output += `📌 *Catatan Penting:*\n`;
    output += `Mohon seluruh siswa/siswi XII SIJA 1 memperhatikan batas waktu yang ditentukan oleh guru pengampu. Disiplin adalah kunci profesionalisme di bidang IT.\n\n`;
    output += `Salam hangat,\n`;
    output += `*Pengurus & Sekretaris Kelas XII SIJA 1*`;
    return output;
  }

  // Default: Standard WhatsApp Format with solid neo-tech clarity
  let output = `❗ *REMINDER TUGAS HARI ${selectedDay.toUpperCase()}* ❗\n`;
  if (selectedDate) {
    output += `📅 *${selectedDate}*\n`;
  }
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  subjectNames.forEach((subj) => {
    output += `○ *${subj.toUpperCase()}*\n`;
    tasksBySubject[subj].forEach((t) => {
      output += `  • *Kategori:* ${t.taskType}\n`;
      output += `  • *Deadline:* ${t.deadlineTime}\n`;
      output += `  • *Pengumpulan:* ${t.submissionMethod}\n`;
      output += `  • *Rincian:* ${t.details}\n\n`;
    });
  });

  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  output += `📌 *Catatan Sekretaris:*\n`;
  output += `Harap menyelesaikan tugas tepat waktu dan konfirmasi ke sekretaris jika ada kendala. Terima kasih & semangat belajarnya! 🔥\n\n`;
  output += `— *XII SIJA 1* • _SIJAsisten_`;

  return output;
}
