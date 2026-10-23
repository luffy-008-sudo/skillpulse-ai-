"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DataSourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [freeApis, setFreeApis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.dataSources(), api.ingestionLogs(), api.freeApiSources()])
      .then(([s, l, f]) => { setSources(s); setLogs(l); setFreeApis(f); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleUpload = async () => {
    if (!csvFile) return;
    setUploading(true);
    try { setUploadResult(await api.uploadCsv(csvFile)); load(); }
    catch (e: any) { setUploadResult({ status: "error", errors: [e.message] }); }
    finally { setUploading(false); }
  };

  const handleNaukriImport = async () => {
    setImporting(true);
    try { setImportResult(await api.importNaukriStatic()); load(); }
    catch (e: any) { setImportResult({ status: "error", errors: [e.message] }); }
    finally { setImporting(false); }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 1100 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>
          <span className="gradient-text">Data Sources & Quality</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Manage data sources, upload job data, and monitor ingestion quality
        </p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* CSV Upload */}
          <div className="card">
            <h2 className="section-title">📤 Upload Job Posting CSV</h2>
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "1rem" }}>
              Required column: <code style={{ color: "#a5b4fc" }}>job_title</code>. 
              Optional: employer_name, state, district, sector, salary_min, salary_max, experience_min_years, skills, posting_date, description
            </p>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)}
                style={{ flex: 1 }} />
              <button className="btn-primary" onClick={handleUpload} disabled={!csvFile || uploading}>
                {uploading ? "Uploading…" : "Upload CSV"}
              </button>
            </div>
            {uploadResult && (
              <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: uploadResult.status === "success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", borderRadius: 8, fontSize: "0.82rem" }}>
                <p style={{ fontWeight: 700, color: uploadResult.status === "success" ? "#34d399" : "#f87171" }}>
                  {uploadResult.status === "success" ? "✅ Import successful" : "❌ Import failed"}
                </p>
                {uploadResult.status === "success" && (
                  <p style={{ color: "#94a3b8" }}>Imported: {uploadResult.records_imported} · Duplicates: {uploadResult.records_duplicate} · Invalid: {uploadResult.records_invalid}</p>
                )}
                {uploadResult.errors?.length > 0 && (
                  <ul style={{ color: "#f87171", marginTop: "0.25rem" }}>{uploadResult.errors.slice(0, 5).map((e: string, i: number) => <li key={i}>{e}</li>)}</ul>
                )}
              </div>
            )}
          </div>

          {/* Naukri Static Import */}
          <div className="card">
            <h2 className="section-title">🗄️ Import Naukri Historical Dataset (2019)</h2>
            <div className="disclaimer" style={{ marginBottom: "1rem" }}>
              <span>⚠️</span>
              <span>
                This imports a <strong>static, unofficial</strong> dataset of Naukri job postings from 2019.
                It is NOT an official Naukri API, not authorised by Naukri.com, and the data is 7 years old.
                Marked as historical reference only. Source: github.com/suraj-996/Naukri.com-API
              </span>
            </div>
            <button className="btn-secondary" onClick={handleNaukriImport} disabled={importing}>
              {importing ? "Importing…" : "Import 2019 Historical Dataset"}
            </button>
            {importResult && (
              <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(16,185,129,0.08)", borderRadius: 8, fontSize: "0.82rem" }}>
                <p style={{ fontWeight: 700, color: "#34d399" }}>✅ {importResult.records_imported} records imported</p>
                <p style={{ color: "#94a3b8" }}>{importResult.disclaimer}</p>
              </div>
            )}
          </div>

          {/* Free API Sources */}
          {freeApis && (
            <div className="card">
              <h2 className="section-title">🔗 Available Free Job Data Sources</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {freeApis.sources.map((s: any) => (
                  <div key={s.name} style={{
                    padding: "0.875rem 1rem", borderRadius: 10,
                    background: "rgba(30,41,59,0.7)",
                    border: `1px solid ${s.status === "available" ? "rgba(16,185,129,0.25)" : s.status === "available_unofficial" ? "rgba(245,158,11,0.25)" : "rgba(99,102,241,0.15)"}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <p style={{ fontWeight: 700, marginBottom: "0.2rem" }}>{s.name}</p>
                      <span className={`badge ${s.status === "available" ? "badge-low" : s.status === "available_unofficial" ? "badge-high" : "badge-medium"}`}>
                        {s.status === "available" ? "✅ Available" : s.status === "available_unofficial" ? "⚠️ Unofficial" : "⚡ Limited"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.4rem" }}>{s.note}</p>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <span style={{ fontSize: "0.72rem", color: "#a5b4fc" }}>Free tier: {s.free_tier}</span>
                      <span style={{ fontSize: "0.72rem", color: "#6366f1" }}>Type: {s.data_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Sources Status */}
          <div className="card">
            <h2 className="section-title">📋 Registered Data Sources</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {sources.map((s: any) => (
                <div key={s.id} style={{ padding: "0.75rem", background: "rgba(30,41,59,0.5)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "#64748b" }}>{s.description?.slice(0, 100)}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.78rem", color: "#a5b4fc", fontWeight: 600 }}>{s.total_records?.toLocaleString()} records</p>
                    {s.last_ingestion && <p style={{ fontSize: "0.7rem", color: "#475569" }}>{new Date(s.last_ingestion).toLocaleDateString()}</p>}
                    {s.data_quality_score && (
                      <p style={{ fontSize: "0.7rem", color: "#64748b" }}>Quality: {(s.data_quality_score * 100).toFixed(0)}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ingestion Logs */}
          <div className="card">
            <h2 className="section-title">📜 Recent Ingestion Logs</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Source", "Type", "Status", "New", "Duplicates", "Started"].map(h => (
                    <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", color: "#64748b", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((l: any) => (
                  <tr key={l.id} style={{ borderBottom: "1px solid rgba(99,102,241,0.06)" }}>
                    <td style={{ padding: "0.5rem 0.75rem" }}>{l.source_name}</td>
                    <td style={{ padding: "0.5rem 0.75rem", color: "#64748b" }}>{l.ingestion_type}</td>
                    <td style={{ padding: "0.5rem 0.75rem" }}>
                      <span className={`badge ${l.status === "success" ? "badge-low" : l.status === "running" ? "badge-medium" : "badge-critical"}`}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.5rem 0.75rem" }}>{l.records_new || 0}</td>
                    <td style={{ padding: "0.5rem 0.75rem", color: "#64748b" }}>{l.records_duplicate || 0}</td>
                    <td style={{ padding: "0.5rem 0.75rem", color: "#475569" }}>{new Date(l.started_at).toLocaleString()}</td>
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
