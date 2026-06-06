import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLayoutWrapper from "@/components/ui/AppLayoutWrapper";
import UnlockToast from "@/components/ui/UnlockToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EndGame | Cinematic Trophy & Achievement Hub",
  description: "Where your achievements forge your legacy. A premium, cinematic achievement and trophy tracking platform for gamers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 flex flex-row">
        <AppLayoutWrapper>
          {children}
        </AppLayoutWrapper>

        {/* Global Cinematic Trophies Popup System */}
        <UnlockToast />
      </body>
    </html>
  );
}


