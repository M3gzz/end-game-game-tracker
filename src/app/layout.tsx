import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";
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
        {/* Desktop and Mobile Navigation Layout */}
        <Sidebar />
        
        {/* Main Canvas Scroll Area */}
        <main className="flex-1 min-h-screen flex flex-col overflow-y-auto pt-16 md:pt-0 pb-16 md:pb-0">
          <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto relative">
            {children}
          </div>
        </main>

        {/* Global Cinematic Trophies Popup System */}
        <UnlockToast />
      </body>
    </html>
  );
}

