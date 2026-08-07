import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { SITE } from "@/constants/region";
import "./globals.css";

const noto = Noto_Sans_JP({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "リアルタイム滋賀｜滋賀県の今がわかる地域情報アプリ",
    template: `%s｜${SITE.name}`,
  },
  description:
    "滋賀県のお店、イベント、駐車場、交通、病院などのリアルタイム情報をみんなで共有。滋賀の「今」がすぐわかる地域情報サービス。",
  applicationName: SITE.name,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "リアルタイム滋賀｜滋賀県の今がわかる地域情報アプリ",
    description:
      "滋賀県のお店、イベント、駐車場、交通、病院などのリアルタイム情報をみんなで共有。滋賀の「今」がすぐわかる地域情報サービス。",
    locale: "ja_JP",
    type: "website",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "リアルタイム滋賀｜滋賀県の今がわかる地域情報アプリ",
    description:
      "滋賀県のお店、イベント、駐車場、交通、病院などのリアルタイム情報をみんなで共有。",
  },
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1a6b8a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${noto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Header />
        <main className="flex-1">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
