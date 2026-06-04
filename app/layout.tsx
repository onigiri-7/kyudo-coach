import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "大学講義解説アプリ",
  description: "講義をもっとわかりやすく",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
