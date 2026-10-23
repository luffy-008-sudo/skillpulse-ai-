"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, Zap, GitMerge,
  FlaskConical, Database, BarChart3, Activity,
  Menu, X, ExternalLink, ShieldCheck
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/jobs", label: "Current Jobs", icon: Activity },
  { href: "/forecast", label: "Skills Forecast", icon: TrendingUp },
  { href: "/gaps", label: "Skill Gaps", icon: GitMerge },
  { href: "/simulator", label: "Policy Simulator", icon: FlaskConical },
  { href: "/emerging", label: "Emerging Skills", icon: Zap },
  { href: "/data-sources", label: "Data Sources", icon: Database },
  { href: "/models", label: "Model Lab", icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "#2B2A33",
      borderBottom: "1px solid rgba(184, 144, 88, 0.28)",
      boxShadow: "0 4px 25px rgba(20, 19, 24, 0.25)",
    }}>
      {/* Top National Mandate Bar */}
      <div style={{
        background: "#212027",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        padding: "0.35rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.72rem",
        color: "#B8B5AD",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "0.85rem" }}>🇮🇳</span>
          <span style={{ letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase" }}>
            Ministry of Skill Development & Entrepreneurship • Government of India
          </span>
          <span style={{
            background: "rgba(184, 144, 88, 0.18)",
            color: "#D4AF37",
            padding: "1px 8px",
            borderRadius: 999,
            fontSize: "0.65rem",
            fontWeight: 700,
            border: "1px solid rgba(184, 144, 88, 0.35)",
          }}>
            MSDE AI Engine
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#68BA7F", fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#68BA7F", display: "inline-block" }} />
            Live Market Sync
          </span>
          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#B89058",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              fontWeight: 600,
            }}
          >
            API Swagger <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div style={{
        maxWidth: 1440,
        margin: "0 auto",
        padding: "0.75rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.5rem",
      }}>
        {/* Brand */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: "linear-gradient(135deg, #B89058 0%, #8C6A35 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(184, 144, 88, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}>
            <span style={{ color: "#FAF8F5", fontWeight: 800, fontSize: "1.1rem", fontFamily: "var(--font-serif)" }}>S</span>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.45rem" }}>
              <span style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#FAF8F5",
                letterSpacing: "-0.01em",
              }}>
                SkillPulse
              </span>
              <span style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                color: "#212027",
                background: "#B89058",
                padding: "1px 6px",
                borderRadius: 4,
                letterSpacing: "0.08em",
              }}>
                AI
              </span>
            </div>
            <p style={{
              fontSize: "0.7rem",
              color: "#A6A29A",
              letterSpacing: "0.05em",
              fontWeight: 400,
              margin: 0,
            }}>
              Today&apos;s Skills. Tomorrow&apos;s Workforce.
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          flexWrap: "wrap",
        }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.55rem 0.85rem",
                  borderRadius: 6,
                  color: active ? "#D4AF37" : "#CDC9C1",
                  background: active ? "rgba(184, 144, 88, 0.16)" : "transparent",
                  borderBottom: active ? "2px solid #B89058" : "2px solid transparent",
                  textDecoration: "none",
                  fontSize: "0.82rem",
                  fontWeight: active ? 700 : 500,
                  letterSpacing: "0.02em",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={14} color={active ? "#D4AF37" : "#A8A49C"} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            display: "none",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.35rem 0.85rem",
            borderRadius: 6,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: "0.75rem",
            color: "#FAF8F5",
          }}>
            <ShieldCheck size={14} color="#B89058" />
            <span>NSDC Calibrated</span>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#FAF8F5",
              padding: "0.45rem",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (if opened) */}
      {mobileOpen && (
        <div style={{
          background: "#212027",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "1rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.6rem 0.85rem",
                  borderRadius: 6,
                  color: active ? "#D4AF37" : "#FAF8F5",
                  background: active ? "rgba(184, 144, 88, 0.15)" : "transparent",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
