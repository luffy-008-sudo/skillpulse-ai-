"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DemoWarning from "@/components/DemoWarning";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";

const HORIZONS = [12, 36, 60];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ForecastPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [horizon, setHorizon] = useState(12);
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"skill" | "sector">("skill");
  const [filterOpts, setFilterOpts] = useState<any>({});

  useEffect(() => {
    api.filterOptions().then(setFilterOpts).catch(() => {});
    api.sectorGrowth().then(setSectors).catch(() => {});
  }, []);

  const runForecast = async () => {
    const target = tab === "skill" ? selectedSkill : selectedSector;
    if (!target) return;
    setLoading(true); setError("");
    try {
      const res = await api.forecast(tab, target, undefined, horizon);
      setForecastData(res);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Combine historical trend + forecast for chart
  const chartData = forecastData ? forecastData.forecast_data.map((p: any) => ({
    date: p.date,
    predicted: p.predicted,
    lower: p.lower_bound,
    upper: p.upper_bound,
    actual: p.actual,
  })) : [];

  return (
    <div style={{ padding: "2rem", maxWidth: 1200 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>
          <span className="gradient-text">Future Skills Forecast</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Engine 2 — Predict demand for skills and sectors · Forecast horizons: 12, 36, 60 months
        </p>
      </div>

      <DemoWarning />

      {/* Controls */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Forecast Type</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["skill", "sector"] as const).map(t => (
                <button key={t} className={`btn-secondary ${tab === t ? "active" : ""}`}
                  onClick={() => { setTab(t); setForecastData(null); }}>
                  {t === "skill" ? "🎯 Skill" : "🏭 Sector"}
                </button>
              ))}
            </div>
          </div>

          {tab === "skill" ? (
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Select Skill</p>
              <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)} style={{ width: "100%" }}>
                <option value="">Choose a skill...</option>
                {(filterOpts.skills || []).slice(0, 100).map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Select Sector</p>
              <select value={selectedSector} onChange={e => setSelectedSector(e.target.value)} style={{ width: "100%" }}>
                <option value="">Choose a sector...</option>
                {sectors.map((s: any) => <option key={s.sector} value={s.sector}>{s.sector}</option>)}
              </select>
            </div>
          )}

          <div>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Horizon</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {HORIZONS.map(h => (
                <button key={h} className={`btn-secondary ${horizon === h ? "active" : ""}`} onClick={() => setHorizon(h)}>
                  {h}mo
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={runForecast}
            disabled={loading || (tab === "skill" ? !selectedSkill : !selectedSector)}>
            {loading ? "Forecasting..." : "Generate Forecast"}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorState message={error} />}

      {forecastData && (
        <div className="animate-in">
          {/* Model info */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div className="card" style={{ padding: "0.75rem 1rem", flex: 1 }}>
              <p style={{ fontSize: "0.7rem", color: "#64748b" }}>Model</p>
              <p style={{ fontWeight: 600, color: "#a5b4fc" }}>{forecastData.model_name}</p>
            </div>
            <div className="card" style={{ padding: "0.75rem 1rem", flex: 1 }}>
              <p style={{ fontSize: "0.7rem", color: "#64748b" }}>Training Period</p>
              <p style={{ fontWeight: 600 }}>{forecastData.training_period}</p>
            </div>
            <div className="card" style={{ padding: "0.75rem 1rem", flex: 1 }}>
              <p style={{ fontSize: "0.7rem", color: "#64748b" }}>Data Points Used</p>
              <p style={{ fontWeight: 600 }}>{forecastData.data_points_used}</p>
            </div>
            <div className="card" style={{ padding: "0.75rem 1rem", flex: 1 }}>
              <p style={{ fontSize: "0.7rem", color: "#64748b" }}>Reliability</p>
              <span className={`badge ${forecastData.is_reliable ? "badge-low" : "badge-critical"}`}>
                {forecastData.is_reliable ? "✅ Reliable" : "⚠️ Limited"}
              </span>
            </div>
          </div>

          {forecastData.reliability_note && (
            <div className="disclaimer" style={{ marginBottom: "1rem" }}>
              <span>ℹ️</span><span>{forecastData.reliability_note}</span>
            </div>
          )}

          {/* Chart */}
          <div className="card">
            <h2 className="section-title">
              📊 Demand Forecast: {forecastData.target_name} ({horizon} months)
            </h2>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" }}>
              Shaded area = 95% confidence interval. Vertical reference = start of forecast period.
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} interval={Math.floor(chartData.length / 8)} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8 }} itemStyle={{ color: "#e2e8f0" }} />
                <Legend />
                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confGrad)" name="Upper CI" legendType="none" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="var(--bg-primary)" name="Lower CI" legendType="none" />
                <Line type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={2.5} dot={false} name="Predicted Demand" />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={false} name="Actual (Historical)" strokeDasharray="4 2" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {forecastData.is_synthetic && (
            <p style={{ fontSize: "0.72rem", color: "#475569", marginTop: "0.75rem", textAlign: "center" }}>
              ⚠️ Forecast generated from synthetic demonstration data. Not real market projections.
            </p>
          )}
        </div>
      )}

      {/* Sector Growth Table */}
      {sectors.length > 0 && !forecastData && (
        <div className="card">
          <h2 className="section-title">🏭 Sector Growth Overview (Historical)</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Sector", "Growth Rate", "Avg Monthly Jobs", "Trend", "Data Points"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", color: "#64748b", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sectors.map((s: any) => (
                  <tr key={s.sector} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
                    <td style={{ padding: "0.65rem 1rem", fontWeight: 500 }}>{s.sector}</td>
                    <td style={{ padding: "0.65rem 1rem", color: s.growth_rate_pct > 0 ? "#34d399" : "#f87171", fontWeight: 600 }}>
                      {s.growth_rate_pct > 0 ? "▲" : "▼"} {Math.abs(s.growth_rate_pct).toFixed(1)}%
                    </td>
                    <td style={{ padding: "0.65rem 1rem" }}>{s.recent_monthly_avg?.toLocaleString()}</td>
                    <td style={{ padding: "0.65rem 1rem" }}>
                      <span className={`badge ${s.trend_direction === "growing" ? "badge-low" : s.trend_direction === "declining" ? "badge-critical" : "badge-medium"}`}>
                        {s.trend_direction}
                      </span>
                    </td>
                    <td style={{ padding: "0.65rem 1rem", color: "#64748b" }}>{s.data_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
