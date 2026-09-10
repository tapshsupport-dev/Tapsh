import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteAssetsProvider } from "@/context/SiteAssetsContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TAPSH | Tap. Connect. Grow.",
  description: "Smart NFC, QR & Digital Solutions for Businesses",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-tapsh-pale-blue text-tapsh-black">
        <SiteAssetsProvider>
          {children}
        </SiteAssetsProvider>
      </body>
    </html>
  );
}

