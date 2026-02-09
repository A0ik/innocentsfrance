import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Footer } from "@/components/footer";
import { FAQ } from "@/components/faq";
import { FloatingLogo } from "@/components/floating-logo";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Innocents France",
  description: "Association humanitaire pour les orphelins et les mamans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
        <FloatingLogo />
        <NavBar />
        <main className="flex-1">
          {children}
        </main>
        <FAQ />
        <Footer />
      </body>
    </html>
  );
}
