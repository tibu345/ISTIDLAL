import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PolicyConsentGate } from "@/components/PolicyConsentGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISTIDLAL Demo",
  description:
    "Static GitHub Pages demo of ISTIDLAL, a browse-first science and technology discovery product built around topics, curated collections, and learning paths.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="shell-body">
        {children}
        <PolicyConsentGate />
      </body>
    </html>
  );
}
