import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Revis - 正規表現ビジュアライザー | Regex Visualizer",
  description: "正規表現をリアルタイムでビジュアライズ。鉄道図・マッチハイライト・コード生成対応。日本語正規表現スニペット集も収録。完全ブラウザ処理でプライバシー安全。",
  keywords: ["正規表現", "regex", "ビジュアライザー", "regex tester", "正規表現テスト", "railroad diagram"],
  verification: {
    google: "8MV1PRxh4OavmFOj5U9SmolbLpefS8DdTluRhA24H1Y",
  },
  openGraph: {
    title: "Revis - 正規表現ビジュアライザー",
    description: "正規表現をリアルタイムでビジュアライズ。日本語対応・完全ブラウザ処理。",
    url: "https://revis.memzlab.com",
    siteName: "Revis",
    locale: "ja_JP",
    type: "website",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3933918581557925"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
