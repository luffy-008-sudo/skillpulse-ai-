"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ModelsPage() {
  const [evals, setEvals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.modelEvaluations().then(setEvals).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const metricsChart = evals.filter(e => e.mae !== null).map(e => ({
    name: e.model_name.replace("_", " "),
    MAE: e.mae?.toFixed(1),
    RMSE: e.rmse?.toFixed(1),
    MAPE: e.mape?.toFixed(1),
    is_baseline: e.is_baseline,
  }));

  return (
    <div style={{ padding: "2rem", maxWidth: 1100 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>
          <span className="gradient-text">Model Performance</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Forecasting model evaluation metrics and backtesting results
        </p>
      </div>

      <div className="disclaimer" style={{ marginBottom: "1.5rem" }}>
        <span>ℹ️</span>
        <span>
          All metrics were computed on <strong>synthetic demonstration data</strong> using chronological train/validation splits.
          They do not represent performance on real labour market data.
          Chronological splits prevent data leakage from future information.
        </span>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {metricsChart.length > 0 && (
            <div className="card">
              <h2 className="section-title">📊 Error Metrics Comparison (Lower is Better)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={metricsChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="MAE" fill="#6366f1" radius={[3,3,0,0]} />
                  <Bar dataKey="RMSE" fill="#8b5cf6" radius={[3,3,0,0]} />
                  <Bar dataKey="MAPE" fill="#06b6d4" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card">
            <h2 className="section-title">📋 Model Evaluation Details</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Model", "Type", "Target", "MAE", "RMSE", "MAPE", "Precision", "Recall", "F1", "Baseline", "Data Points"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: "0.72rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evals.map((e, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(99,102,241,0.06)" }}>
                    <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>{e.model_name}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#64748b" }}>{e.forecast_type}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#64748b" }}>{e.target_name || "General"}</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>{e.mae?.toFixed(2) || "—"}</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>{e.rmse?.toFixed(2) || "—"}</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>{e.mape ? `${e.mape.toFixed(1)}%` : "—"}</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>{e.precision?.toFixed(2) || "—"}</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>{e.recall?.toFixed(2) || "—"}</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>{e.f1_score?.toFixed(2) || "—"}</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      <span className={`badge ${e.is_baseline ? "badge-demo" : "badge-low"}`}>
                        {e.is_baseline ? "Baseline" : "Enhanced"}
                      </span>
                    </td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#64748b" }}>{e.data_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2 className="section-title">🔬 Methodology Notes</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.6 }}>
              <div>
                <p style={{ fontWeight: 700, color: "#a5b4fc", marginBottom: "0.4rem" }}>Train/Validation Split</p>
                <p>Chronological split to prevent data leakage from future information. Training: first 24 months. Validation: last 12 months of historical data.</p>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: "#a5b4fc", marginBottom: "0.4rem" }}>Metrics Used</p>
                <p>MAE (Mean Absolute Error), RMSE (Root Mean Square Error), MAPE (Mean Absolute Percentage Error) for regression. Precision/Recall/F1 for shortage risk classification.</p>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: "#a5b4fc", marginBottom: "0.4rem" }}>Baseline vs Enhanced</p>
                <p>Baseline models (ARIMA, Linear Trend) are simple reference points. Enhanced models (XGBoost, Random Forest) use additional features like seasonality, sector growth, and lag variables.</p>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: "#a5b4fc", marginBottom: "0.4rem" }}>Limitations</p>
                <p>All evaluations use synthetic data. Real-world performance may differ significantly. Forecasts become less reliable beyond 12 months. Always display confidence intervals.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
