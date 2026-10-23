import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{
      background: "#212027",
      color: "#FAF8F5",
      borderTop: "1px solid rgba(184, 144, 88, 0.25)",
      marginTop: "4rem",
      padding: "3.5rem 1.5rem 2rem",
    }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "2.5rem",
          marginBottom: "3rem",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
              <div style={{
                width: 30, height: 30, borderRadius: 6,
                background: "linear-gradient(135deg, #B89058, #8C6A35)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#FAF8F5", fontWeight: 800, fontSize: "0.9rem", fontFamily: "var(--font-serif)" }}>S</span>
              </div>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 700, color: "#FAF8F5" }}>
                SkillPulse AI
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#C4C0B6", lineHeight: 1.6, marginBottom: "1rem" }}>
              Today&apos;s Skills. Tomorrow&apos;s Workforce.
            </p>
            <p style={{ fontSize: "0.75rem", color: "#9C978D", lineHeight: 1.5 }}>
              AI-powered Labour Market Intelligence and Future Skill Demand-Supply Forecasting Platform for the Ministry of Skill Development & Entrepreneurship (MSDE).
            </p>
          </div>

          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", fontWeight: 600, color: "#D4AF37", letterSpacing: "0.04em", marginBottom: "1rem" }}>
              Intelligence Engines
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              <li><Link href="/forecast" style={{ color: "#CDC9C1", textDecoration: "none", fontSize: "0.82rem" }}>→ 12–60 Month Skills Demand Forecasting</Link></li>
              <li><Link href="/gaps" style={{ color: "#CDC9C1", textDecoration: "none", fontSize: "0.82rem" }}>→ Demand vs. Supply Gap Severity Matrix</Link></li>
              <li><Link href="/simulator" style={{ color: "#CDC9C1", textDecoration: "none", fontSize: "0.82rem" }}>→ Policy & Budget Capacity Simulator</Link></li>
              <li><Link href="/emerging" style={{ color: "#CDC9C1", textDecoration: "none", fontSize: "0.82rem" }}>→ Emerging & Declining Skills Radar</Link></li>
            </ul>
          </div>

          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", fontWeight: 600, color: "#D4AF37", letterSpacing: "0.04em", marginBottom: "1rem" }}>
              Methodology & Standards
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              <li><Link href="/models" style={{ color: "#CDC9C1", textDecoration: "none", fontSize: "0.82rem" }}>→ ARIMA / Prophet / LSTM Ensembles</Link></li>
              <li><Link href="/data-sources" style={{ color: "#CDC9C1", textDecoration: "none", fontSize: "0.82rem" }}>→ Live Ingestion Connectors</Link></li>
              <li><span style={{ color: "#9C978D", fontSize: "0.82rem" }}>→ NCO-2015 & O*NET Taxonomy Mapped</span></li>
              <li><span style={{ color: "#9C978D", fontSize: "0.82rem" }}>→ NSDC Calibrated State Targets</span></li>
            </ul>
          </div>

          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", fontWeight: 600, color: "#D4AF37", letterSpacing: "0.04em", marginBottom: "1rem" }}>
              Backend API
            </p>
            <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(184, 144, 88, 0.2)", borderRadius: 8, padding: "0.85rem", marginBottom: "0.85rem" }}>
              <a href="/docs" target="_blank" rel="noreferrer" style={{ color: "#B89058", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                Swagger OpenAPI Docs <ExternalLink size={12} />
              </a>
            </div>
            <p style={{ fontSize: "0.7rem", color: "#8E8B83", lineHeight: 1.5 }}>
              Calibrated for MSDE Planning Officers, Sector Skill Councils, and Curriculum Designers across 36 States & UTs.
            </p>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", fontSize: "0.75rem", color: "#8E8B83" }}>
          <div>© 2026 SkillPulse AI. Formulated for the Ministry of Skill Development & Entrepreneurship.</div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span>Privacy Policy</span>
            <span>Terms of Reference</span>
            <span>Data Provenance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
