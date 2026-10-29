import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PhotoStoreProvider } from "@/lib/store/photo-store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixora AI — Intelligent Visual File Organizer",
  description: "Turn thousands of scattered photos into a searchable, beautifully organized visual library with AI.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FCFAFF] text-[#241735]">
        <PhotoStoreProvider>{children}</PhotoStoreProvider>
      </body>
    </html>
  );
}
