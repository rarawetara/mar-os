import type { Metadata, Viewport } from "next";
import { Montserrat, Caveat, Baloo_2, Inter } from "next/font/google";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import "./globals.css";

// Anton/Archivo Black (спека в CLAUDE.md) не покрывают кириллицу — заголовки на русском
// молча падали бы на тонкий системный шрифт. Montserrat 800/900 держит и латиницу, и
// кириллицу в том же "жирный чёрный" духе. См. MAR.Plan.md BL-16.
const display = Montserrat({
  variable: "--font-display-src",
  weight: ["800", "900"],
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "cyrillic"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "MÄR",
  description: "Личный second brain: заметки, задачи, напоминания — всё в одном месте.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MÄR",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${caveat.variable} ${baloo.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-paper text-ink">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
