"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DemoWarning from "@/components/DemoWarning";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function EmergingPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.emergingSkills(30)
      .then(setSkills)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tiers = [
    { label: "🔴 Critical Growth (>30%)", color: "#ef4444", items: skills.filter(s => s.growth_rate_pct > 30) },
    { label: "🟠 High Growth (15–30%)", color: "#f59e0b", items: skills.filter(s => s.growth_rate_pct > 15 && s.growth_rate_pct <= 30) },
    { label: "🟡 Moderate Growth (5–15%)", color: "#6366f1", items: skills.filter(s => s.growth_rate_pct > 5 && s.growth_rate_pct <= 15) },
  ];

  const scatterData = skills.map(s => ({
    x: s.recent_monthly_demand,
    y: s.growth_rate_pct,
    name: s.skill_name,
    category: s.category,
  }));

  return (
    <div style={{ padding: "2rem", maxWidth: 1200 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>
          <span className="gradient-text">Emerging Skills Radar</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Skills showing the strongest upward demand trends — future workforce priorities
        </p>
      </div>

      <DemoWarning />

      {loading ? <LoadingSpinner /> : (
        <div className="animate-in">
          {/* Scatter: Demand vs Growth */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 className="section-title">📡 Skill Demand vs Growth Rate</h2>
            <p style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "0.75rem" }}>
              Top-right quadrant = high demand AND high growth = highest strategic priority
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="x" name="Monthly Demand" tick={{ fill: "#64748b", fontSize: 10 }} label={{ value: "Monthly Demand", position: "insideBottom", offset: -4, fill: "#64748b", fontSize: 10 }} />
                <YAxis dataKey="y" name="Growth Rate %" tick={{ fill: "#64748b", fontSize: 10 }} label={{ value: "Growth %", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 10 }} />
                <Tooltip content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div style={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, padding: "0.5rem 0.75rem" }}>
                      <p style={{ fontWeight: 700, color: "#a5b4fc" }}>{d.name}</p>
                      <p style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{d.category}</p>
                      <p style={{ fontSize: "0.78rem" }}>Demand: <strong>{d.x}</strong></p>
                      <p style={{ fontSize: "0.78rem" }}>Growth: <strong>{d.y?.toFixed(1)}%</strong></p>
                    </div>
                  );
                }} />
                <Scatter data={scatterData} fill="#6366f1" opacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Tier cards */}
          {tiers.map(tier => tier.items.length > 0 && (
            <div key={tier.label} style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", color: tier.color }}>{tier.label}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
                {tier.items.map((s: any) => (
                  <div key={s.skill_name} className="card" style={{ borderLeft: `3px solid ${tier.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <p style={{ fontWeight: 700 }}>{s.skill_name}</p>
                      <span style={{ fontSize: "1.1rem", fontWeight: 800, color: tier.color }}>
                        +{s.growth_rate_pct.toFixed(1)}%
                      </span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.5rem" }}>{s.category}</p>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <span style={{ fontSize: "0.72rem", color: "#a5b4fc" }}>📊 {s.recent_monthly_demand}/mo demand</span>
                      <span style={{ fontSize: "0.72rem", color: s.trend_direction === "rising" ? "#34d399" : "#64748b" }}>
                        {s.trend_direction === "rising" ? "↑ Rising" : s.trend_direction === "stable" ? "→ Stable" : "↓ Declining"}
                      </span>
                    </div>
                    {s.is_synthetic && <p style={{ fontSize: "0.65rem", color: "#475569", marginTop: "0.3rem" }}>⚠️ Synthetic data</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
