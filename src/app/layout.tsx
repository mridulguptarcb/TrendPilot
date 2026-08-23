import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrendForge | RAG-Powered Content Automation",
  description: "Automated trend discovery, RAG evidence retrieval, grounded content generation, and multi-platform publishing engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-orange-500/30 selection:text-orange-200">
        {children}
      </body>
    </html>
  );
}
