import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SkillPulse AI – Today's Skills. Tomorrow's Workforce.",
  description:
    "AI-Powered Labour Market Intelligence and Future Skill Demand-Supply Forecasting Platform for India's Ministry of Skill Development and Entrepreneurship (MSDE).",
  keywords: "labour market intelligence, skill forecasting, India workforce, MSDE, NSDC, skill demand-supply gap",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}>
        <Navbar />
        <main style={{ flex: 1, width: "100%" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
