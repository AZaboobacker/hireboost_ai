import "./globals.css";
import type { Metadata } from "next";
import { AnalyticsPlaceholder } from "@/components/analytics-placeholder";

export const metadata: Metadata = {
  title: "HireBoost AI",
  description: "AI Resume Optimizer for ATS success."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <AnalyticsPlaceholder />
      </body>
    </html>
  );
}
