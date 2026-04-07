import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import localFont from 'next/font/local';
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const serifPro = localFont({
  src: '../public/assets/fonts/SourceSerifPro-Regular.ttf',
  variable: '--font-serif-pro',
  weight: '400',
  style: 'normal',

})

const radioCanadaBig = localFont({
  src: '../public/assets/fonts/RadioCanadaBig-VariableFont_wght.ttf',
  variable: '--font-radio-canada-big'
})

export const metadata: Metadata = {
  title: "Aetherfield",
  description: "Track impact, reduce emissions, and accelerate progress with Sustainability insights build for businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${serifPro.variable} ${geistMono.variable} ${radioCanadaBig.variable} antialiased scroll-smooth`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
