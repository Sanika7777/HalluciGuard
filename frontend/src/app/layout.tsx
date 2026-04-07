import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-coromant",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "HalluciGuard — LLM Hallucination Risk Detector",
  description:
    "Detect hallucination risk in your LLM prompts and responses. Analyze word-by-word risk scores and engineer safer prompts.",
  openGraph: {
    title: "HalluciGuard",
    description: "Detect and reduce hallucination risk in LLM prompts.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${poppins.variable} ${jetbrains.variable}`}
    >
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
