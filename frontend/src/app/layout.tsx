import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const mavenPro = localFont({
  src: [
    {
      path: "../../public/fonts/MavenPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/MavenPro-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/MavenPro-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-maven-pro",
})

export const metadata: Metadata = {
  title: "Medoraa Labs",
  description: "Advanced Diagnostics & Expert Care",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", mavenPro.variable)} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
