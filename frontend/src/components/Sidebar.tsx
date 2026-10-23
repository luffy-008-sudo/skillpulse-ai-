"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, Zap, GitMerge,
  FlaskConical, Database, BarChart3, Activity
} from "lucide-react";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/jobs", label: "Current Jobs", icon: Activity },
  { href: "/forecast", label: "Skills Forecast", icon: TrendingUp },
  { href: "/gaps", label: "Skill Gap Analysis", icon: GitMerge },
  { href: "/simulator", label: "Policy Simulator", icon: FlaskConical },
  { href: "/emerging", label: "Emerging Skills", icon: Zap },
  { href: "/data-sources", label: "Data Sources", icon: Database },
  { href: "/models", label: "Model Performance", icon: BarChart3 },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside style={{
      width: 240,
      position: "fixed",
      top: 0, left: 0, bottom: 0,
      background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
      borderRight: "1px solid rgba(99,102,241,0.2)",
      display: "flex",
      flexDirection: "column",
      zIndex: 50,
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: "1px solid rgba(99,102,241,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(99,102,241,0.5)",
          }}>
            <span style={{ fontSize: "1rem" }}>⚡</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#f1f5f9" }}>SkillPulse AI</span>
        </div>
        <p style={{ fontSize: "0.7rem", color: "#64748b", lineHeight: 1.4 }}>
          Today&apos;s Skills. Tomorrow&apos;s Workforce.
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.75rem 0.75rem" }}>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem", padding: "0 0.5rem" }}>
          Navigation
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              padding: "0.55rem 0.75rem",
              borderRadius: 8,
              marginBottom: "0.125rem",
              color: active ? "#a5b4fc" : "#64748b",
              background: active ? "rgba(99,102,241,0.15)" : "transparent",
              borderLeft: active ? "2px solid #6366f1" : "2px solid transparent",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: active ? 600 : 400,
              transition: "all 0.15s",
            }}>
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* MSDE Badge */}
      <div style={{
        margin: "0.75rem",
        padding: "0.75rem",
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: 10,
      }}>
        <p style={{ fontSize: "0.68rem", color: "#6366f1", fontWeight: 700, marginBottom: 2 }}>
          🇮🇳 MSDE Initiative
        </p>
        <p style={{ fontSize: "0.65rem", color: "#475569", lineHeight: 1.4 }}>
          Ministry of Skill Development & Entrepreneurship
        </p>
      </div>
    </aside>
  );
}
