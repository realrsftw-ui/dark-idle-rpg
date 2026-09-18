import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Askmörker",
  description: "Ett mörkt dark-fantasy idle-RPG med stat-baserad strid, skills och offline-progression.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sv" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
