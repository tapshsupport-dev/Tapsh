import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import { SiteAssetsProvider } from "@/context/SiteAssetsContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "TAPSH | Tap. Connect. Grow.",
  description: "Smart NFC, QR & Digital Solutions for Businesses",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${caveat.variable} h-full w-full max-w-full overflow-x-hidden antialiased`}
    >
      <body className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col font-sans bg-tapsh-pale-blue text-tapsh-black">
        <SiteAssetsProvider>
          {children}
        </SiteAssetsProvider>
      </body>
    </html>
  );
}
