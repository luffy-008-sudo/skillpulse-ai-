"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import DemoWarning from "@/components/DemoWarning";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function SimulatorPage() {
  const [filters, setFilters] = useState<any>({});
  const [form, setForm] = useState({
    skill_name: "", sector: "", state: "",
    horizon_months: 12, training_seats: 200,
    course_duration_months: 6,
    completion_rate: 0.75, employability_rate: 0.70,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { api.filterOptions().then(setFilters).catch(() => {}); }, []);

  const run = async () => {
    setLoading(true); setError("");
    try {
      const r = await api.simulate(form);
      setResult(r);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const chartData = result ? [
    { label: "Current Gap", value: Math.max(0, result.current_gap), fill: "#f59e0b" },
    { label: "Gap Without Training", value: Math.max(0, result.projected_gap_no_intervention), fill: "#ef4444" },
    { label: "Gap With Training", value: Math.max(0, result.projected_gap_with_training), fill: "#10b981" },
  ] : [];

  return (
    <div style={{ padding: "2rem", maxWidth: 1100 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>
          <span className="gradient-text">Training Policy Simulator</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Model how training capacity changes affect the skill gap. Results are <strong>scenarios</strong>, not guarantees.
        </p>
      </div>

      <DemoWarning />
      <div className="disclaimer" style={{ marginBottom: "1.5rem" }}>
        <span>📌</span>
        <span>Simulator results are based on simplified assumptions. They do not account for all real-world factors.
        Use for directional planning only. Clearly labelled as scenario projections.</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "1.5rem" }}>
        {/* Controls */}
        <div className="card" style={{ height: "fit-content" }}>
          <h2 className="section-title">⚙️ Configure Scenario</h2>

          {[
            { label: "Skill (optional)", key: "skill_name", type: "select", options: (filters.skills || []).slice(0, 100) },
            { label: "Sector (optional)", key: "sector", type: "select", options: filters.sectors || [] },
            { label: "State (optional)", key: "state", type: "select", options: filters.states || [] },
          ].map(({ label, key, options }) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "0.3rem" }}>{label}</p>
              <select value={(form as any)[key]} onChange={e => f(key, e.target.value)} style={{ width: "100%" }}>
                <option value="">— Any —</option>
                {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}

          {[
            { label: "Forecast Horizon (months)", key: "horizon_months", min: 6, max: 60, step: 6 },
            { label: "Training Seats (per batch)", key: "training_seats", min: 10, max: 5000, step: 50 },
            { label: "Course Duration (months)", key: "course_duration_months", min: 1, max: 24, step: 1 },
          ].map(({ label, key, min, max, step }) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ fontSize: "0.78rem", color: "#64748b" }}>{label}</p>
                <p style={{ fontSize: "0.78rem", color: "#a5b4fc", fontWeight: 600 }}>{(form as any)[key]}</p>
              </div>
              <input type="range" min={min} max={max} step={step}
                value={(form as any)[key]}
                onChange={e => f(key, Number(e.target.value))}
                style={{ width: "100%", accentColor: "#6366f1" }}
              />
            </div>
          ))}

          {[
            { label: "Completion Rate", key: "completion_rate", min: 0.1, max: 1.0, step: 0.05 },
            { label: "Employability Rate", key: "employability_rate", min: 0.1, max: 1.0, step: 0.05 },
          ].map(({ label, key, min, max, step }) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ fontSize: "0.78rem", color: "#64748b" }}>{label}</p>
                <p style={{ fontSize: "0.78rem", color: "#a5b4fc", fontWeight: 600 }}>{((form as any)[key] * 100).toFixed(0)}%</p>
              </div>
              <input type="range" min={min} max={max} step={step}
                value={(form as any)[key]}
                onChange={e => f(key, Number(e.target.value))}
                style={{ width: "100%", accentColor: "#6366f1" }}
              />
            </div>
          ))}

          <button className="btn-primary" onClick={run} disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
            {loading ? "Running..." : "▶ Run Simulation"}
          </button>
        </div>

        {/* Results */}
        <div>
          {loading && <LoadingSpinner />}
          {error && <div className="disclaimer" style={{ borderColor: "rgba(239,68,68,0.3)" }}><span>❌</span><span>{error}</span></div>}

          {result && (
            <div className="animate-in">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                {[
                  { label: "Current Skill Gap", val: result.current_gap.toFixed(0), color: "#f59e0b", icon: "📊" },
                  { label: "Gap Without Training", val: result.projected_gap_no_intervention.toFixed(0), color: "#ef4444", icon: "📉" },
                  { label: "Gap With Training", val: result.projected_gap_with_training.toFixed(0), color: "#10b981", icon: "📈" },
                ].map(k => (
                  <div key={k.label} className="card" style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem" }}>{k.icon}</p>
                    <p style={{ fontSize: "1.6rem", fontWeight: 800, color: k.color }}>{k.val}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{k.label}</p>
                  </div>
                ))}
              </div>

              <div className="card" style={{ marginBottom: "1rem" }}>
                <h2 className="section-title">📊 Gap Comparison</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                    <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8 }} />
                    <Bar dataKey="value" name="Skill Gap" radius={[4, 4, 0, 0]}>
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card" style={{ marginBottom: "1rem" }}>
                <h2 className="section-title">📋 Scenario Outcomes</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {[
                    { label: "Trainees Produced", val: result.trainees_produced.toFixed(0), icon: "🎓" },
                    { label: "Employable Graduates", val: result.employable_graduates.toFixed(0), icon: "💼" },
                    { label: "Gap Reduction", val: result.gap_reduction.toFixed(0), icon: "📉" },
                    { label: "Gap Reduction %", val: `${result.gap_reduction_pct.toFixed(1)}%`, icon: "📊" },
                    { label: "Time to Impact", val: `${result.time_to_impact_months} months`, icon: "⏱️" },
                  ].map(k => (
                    <div key={k.label} style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "0.75rem", background: "rgba(99,102,241,0.06)", borderRadius: 8 }}>
                      <span style={{ fontSize: "1.3rem" }}>{k.icon}</span>
                      <div>
                        <p style={{ fontSize: "0.72rem", color: "#64748b" }}>{k.label}</p>
                        <p style={{ fontWeight: 700, color: "#a5b4fc" }}>{k.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2 className="section-title">📌 Assumptions</h2>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {result.assumptions.map((a: string, i: number) => (
                    <li key={i} style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", gap: "0.5rem" }}>
                      <span style={{ color: "#6366f1" }}>•</span> {a}
                    </li>
                  ))}
                </ul>
                <p style={{ fontSize: "0.72rem", color: "#475569", marginTop: "0.75rem", fontStyle: "italic" }}>
                  ⚠️ {result.disclaimer}
                </p>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#475569", gap: "0.5rem" }}>
              <p style={{ fontSize: "3rem" }}>🔬</p>
              <p style={{ fontSize: "1rem", fontWeight: 600 }}>Configure and run a simulation</p>
              <p style={{ fontSize: "0.8rem" }}>Adjust parameters on the left and click Run Simulation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
