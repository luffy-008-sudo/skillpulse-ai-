"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DemoWarning from "@/components/DemoWarning";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SEVERITY_ORDER = ["critical", "high", "moderate", "low", "surplus"];
const SEVERITY_COLOR: Record<string, string> = {
  critical: "#ef4444", high: "#f59e0b", moderate: "#6366f1", low: "#10b981", surplus: "#06b6d4"
};

export default function GapsPage() {
  const [gaps, setGaps] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sector, setSector] = useState("");
  const [state, setState] = useState("");
  const [priority, setPriority] = useState("");
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    api.filterOptions().then(setFilters).catch(() => {});
    api.gapSummary().then(setSummary).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.gapAnalysis({ sector: sector || undefined, state: state || undefined, limit: 30 }),
      api.recommendations(sector || undefined, state || undefined, priority || undefined),
    ])
      .then(([g, r]) => { setGaps(g); setRecs(r); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [sector, state, priority]);

  const chartData = (gaps?.items || []).slice(0, 12).map((g: any) => ({
    name: g.target_name.length > 15 ? g.target_name.slice(0, 15) + "…" : g.target_name,
    demand: g.current_demand,
    supply: g.estimated_supply,
    gap: Math.abs(g.gap_absolute),
    severity: g.gap_severity,
  }));

  return (
    <div style={{ padding: "2rem", maxWidth: 1300 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>
          <span className="gradient-text">Skill Gap Analysis</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Engine 3 — Demand vs Supply gaps by skill, sector, and region
        </p>
      </div>

      <DemoWarning />

      {/* Summary KPIs */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Skills Analysed", value: summary.total_skills_analyzed, icon: "🔍", color: "#6366f1" },
            { label: "Critical Shortages", value: summary.critical_shortages, icon: "🚨", color: "#ef4444" },
            { label: "High Shortages", value: summary.high_shortages, icon: "⚠️", color: "#f59e0b" },
            { label: "Surplus Skills", value: summary.surplus_skills, icon: "📦", color: "#06b6d4" },
          ].map(k => (
            <div key={k.label} className="card" style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.8rem" }}>{k.icon}</p>
              <p style={{ fontSize: "1.8rem", fontWeight: 800, color: k.color }}>{k.value}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{k.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <select value={state} onChange={e => setState(e.target.value)} style={{ minWidth: 160 }}>
          <option value="">All States</option>
          {(filters.states || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sector} onChange={e => setSector(e.target.value)} style={{ minWidth: 200 }}>
          <option value="">All Sectors</option>
          {(filters.sectors || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)} style={{ minWidth: 140 }}>
          <option value="">All Priorities</option>
          {["critical","high","medium","low"].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
        </select>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorState message={error} />}

      {!loading && gaps && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* Gap chart */}
          <div className="card">
            <h2 className="section-title">📊 Demand vs Supply (Top Skills)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 9 }} width={110} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8 }} itemStyle={{ color: "#e2e8f0" }} />
                <Bar dataKey="demand" fill="#6366f1" name="Demand" radius={[0,3,3,0]} />
                <Bar dataKey="supply" fill="#10b981" name="Supply" radius={[0,3,3,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gap table */}
          <div className="card" style={{ overflow: "auto", maxHeight: 360 }}>
            <h2 className="section-title">🚨 Gap Severity Rankings</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Skill", "Severity", "Gap", "Demand", "Supply", "Quality"].map(h => (
                    <th key={h} style={{ padding: "0.5rem 0.6rem", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: "0.72rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(gaps.items || []).map((g: any) => (
                  <tr key={g.target_name + g.state} style={{ borderBottom: "1px solid rgba(99,102,241,0.06)" }}>
                    <td style={{ padding: "0.5rem 0.6rem", fontWeight: 500 }}>{g.target_name}</td>
                    <td style={{ padding: "0.5rem 0.6rem" }}>
                      <span className={`badge badge-${g.gap_severity}`}>{g.gap_severity}</span>
                    </td>
                    <td style={{ padding: "0.5rem 0.6rem", color: g.gap_absolute > 0 ? "#f87171" : "#34d399", fontWeight: 600 }}>
                      {g.gap_absolute > 0 ? "–" : "+"}{Math.abs(g.gap_absolute).toFixed(0)}
                    </td>
                    <td style={{ padding: "0.5rem 0.6rem" }}>{g.current_demand}</td>
                    <td style={{ padding: "0.5rem 0.6rem" }}>{g.estimated_supply}</td>
                    <td style={{ padding: "0.5rem 0.6rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 32, height: 4, background: "rgba(99,102,241,0.15)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${(g.data_quality_score || 0) * 100}%`, height: "100%", background: "#6366f1" }} />
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{((g.data_quality_score || 0) * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <h2 className="section-title">📋 Training Recommendations</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "0.75rem" }}>
              {recs.map((r: any, i) => (
                <div key={i} style={{
                  background: "rgba(30,41,59,0.7)", border: `1px solid ${SEVERITY_COLOR[r.priority] || "#6366f1"}33`,
                  borderLeft: `3px solid ${SEVERITY_COLOR[r.priority] || "#6366f1"}`,
                  borderRadius: 10, padding: "1rem",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{r.skill_name}</p>
                    <span className={`badge badge-${r.priority}`}>{r.priority}</span>
                  </div>
                  {r.sector && <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.4rem" }}>Sector: {r.sector}</p>}
                  <p style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.5, marginBottom: "0.5rem" }}>{r.rationale}</p>
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    {r.recommended_seats && <span style={{ fontSize: "0.72rem", color: "#a5b4fc" }}>🪑 {r.recommended_seats} seats</span>}
                    {r.recommended_duration_months && <span style={{ fontSize: "0.72rem", color: "#a5b4fc" }}>⏱️ {r.recommended_duration_months}mo course</span>}
                    {r.recommended_nsqf_level && <span style={{ fontSize: "0.72rem", color: "#a5b4fc" }}>📜 NSQF L{r.recommended_nsqf_level}</span>}
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Confidence: {(r.confidence_score * 100).toFixed(0)}%</span>
                  </div>
                  {r.is_synthetic && <p style={{ fontSize: "0.65rem", color: "#475569", marginTop: "0.4rem" }}>⚠️ Synthetic data</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
