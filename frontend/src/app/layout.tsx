import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import WhatsAppButton from "@/components/WhatsAppButton";

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
  title: "Medoraa Labs | Best Diagnostics & Blood Tests in Vijayawada",
  description: "Medoraa Labs provides top diagnostic services, accurate blood tests, and complete health checkup packages in Vijayawada. Book lab tests online with home collection.",
  keywords: "Medoraa Labs, pathology lab Vijayawada, diagnostics Vijayawada, blood test Gollapudi, medical laboratory Andhra Pradesh, full body checkup Vijayawada, NABL accredited lab Vijayawada, health test home collection",
  authors: [{ name: "Medoraa Labs" }],
  creator: "Medoraa Labs",
  publisher: "Medoraa Labs",
  metadataBase: new URL("https://medoraa.com"),
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://medoraa.com",
    title: "Medoraa Labs | Best Diagnostics & Blood Tests in Vijayawada",
    description: "Your trusted NABL-accredited laboratory for advanced medical diagnostics, comprehensive health checkups, and expert medical care in Vijayawada and Gollapudi.",
    siteName: "Medoraa Labs",
    images: [{
      url: "/logo.png",
      width: 800,
      height: 600,
      alt: "Medoraa Labs Logo",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Medoraa Labs | Best Diagnostics & Blood Tests in Vijayawada",
    description: "Your trusted laboratory for advanced medical diagnostics, comprehensive health checkups, and expert medical care in Vijayawada.",
    images: ["/logo.png"],
  },
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
        <WhatsAppButton />
      </body>
    </html>
  );
}
