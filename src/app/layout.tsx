import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SEKREKITA — Asisten Catat Tugas & Generator Reminder WhatsApp Kelas",
  description:
    "Aplikasi pencatat tugas harian & generator format reminder WhatsApp kelas yang cepat, praktis, dan siap pakai untuk Sekretaris Kelas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-zine-paper text-[#141413] antialiased selection:bg-[#C8F560] selection:text-[#141413]">
        {children}
      </body>
    </html>
  );
}
