import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIJAsisten — Dashboard Tugas & WhatsApp Reminder XII SIJA 1",
  description:
    "Aplikasi dashboard sekretaris kelas XII SIJA 1 untuk konsolidasi tugas siswa dan generator format reminder WhatsApp terstandarisasi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F9FAFB] text-[#111827] antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
