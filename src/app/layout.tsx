import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

/* Display: Bricolage Grotesque — slightly irregular, so headings feel written
   rather than set. UI: Public Sans — plain, high x-height, legible at 13px. */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-family",
  display: "swap",
});

const sans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Note-Stack",
  description: "Boards, lists and cards for work that moves.",
  icons: {
    icon: "/Note.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body
        className="flex h-dvh flex-col overflow-hidden bg-paper font-sans text-ink antialiased"
        suppressHydrationWarning
      >
        <Header />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
