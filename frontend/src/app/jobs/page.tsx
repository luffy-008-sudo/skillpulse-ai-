"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import DemoWarning from "@/components/DemoWarning";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, Briefcase, MapPin, IndianRupee, Calendar, GraduationCap } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any>(null);
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("");
  const [sector, setSector] = useState("");
  const [skill, setSkill] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.filterOptions().then(setFilters).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    api.searchJobs({
      state: state || undefined,
      sector: sector || undefined,
      skill: skill || undefined,
      q: q || undefined,
      page,
      page_size: 25,
    })
      .then(setJobs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [state, sector, skill, q, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      {/* Editorial Dark Hero */}
      <section style={{
        background: "linear-gradient(180deg, #2B2A33 0%, #23222A 100%)",
        color: "#FAF8F5",
        padding: "3rem 1.5rem 2.5rem",
        borderBottom: "1px solid rgba(184, 144, 88, 0.3)",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <p style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "#D4AF37",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}>
            Engine 1 • Real-Time Ingestion
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 3vw, 2.75rem)",
                fontWeight: 700,
                color: "#FAF8F5",
                lineHeight: 1.15,
                marginBottom: "0.4rem",
              }}>
                Current Job Postings Intelligence
              </h1>
              <p style={{ color: "#CDC9C1", fontSize: "0.95rem", maxWidth: 700 }}>
                Granular micro-level analysis of live and historical hiring requisitions across India&apos;s leading job portals.
              </p>
            </div>
            {jobs && (
              <div style={{
                background: "rgba(184, 144, 88, 0.15)",
                border: "1px solid rgba(184, 144, 88, 0.35)",
                borderRadius: 8,
                padding: "0.6rem 1.2rem",
                textAlign: "right",
              }}>
                <span style={{ fontSize: "0.72rem", color: "#CDC9C1", textTransform: "uppercase", letterSpacing: "0.08em" }}>Matched Results</span>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", fontWeight: 700, color: "#D4AF37", margin: 0 }}>
                  {jobs.total?.toLocaleString()} Jobs
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <DemoWarning />

        {/* Minimalist Filter Bar */}
        <div className="card" style={{ padding: "1.25rem", marginBottom: "1.75rem", background: "#FFFFFF" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
              <input
                type="text"
                placeholder="Search job title, skills, or employer…"
                value={q}
                onChange={e => { setQ(e.target.value); setPage(1); }}
                style={{ width: "100%", paddingLeft: "2.2rem" }}
              />
              <Search size={15} color="#9E9A91" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            </div>

            <select
              value={state}
              onChange={e => { setState(e.target.value); setPage(1); }}
              style={{ minWidth: 160 }}
            >
              <option value="">All States</option>
              {(filters.states || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={sector}
              onChange={e => { setSector(e.target.value); setPage(1); }}
              style={{ minWidth: 200 }}
            >
              <option value="">All Industry Sectors</option>
              {(filters.sectors || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={skill}
              onChange={e => { setSkill(e.target.value); setPage(1); }}
              style={{ minWidth: 180 }}
            >
              <option value="">All Extracted Skills</option>
              {(filters.skills || []).slice(0, 50).map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>

            {(state || sector || skill || q) && (
              <button
                className="btn-secondary"
                onClick={() => { setState(""); setSector(""); setSkill(""); setQ(""); setPage(1); }}
                style={{ background: "#FAF8F5", borderColor: "#B89058", color: "#B89058", fontWeight: 600 }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <LoadingSpinner message="Querying live labour requisitions..." />
        ) : (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "2rem" }}>
              {(jobs?.items || []).map((j: any) => (
                <div key={j.id} className="card" style={{ padding: "1.35rem 1.75rem", borderLeft: "3px solid #B89058" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div>
                      <h3 style={{
                        fontFamily: "var(--font-serif)",
                        fontWeight: 700,
                        fontSize: "1.15rem",
                        color: "#23222A",
                        marginBottom: "0.3rem",
                      }}>
                        {j.job_title}
                      </h3>
                      <p style={{ fontSize: "0.84rem", color: "#706C64", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Briefcase size={13} color="#B89058" />
                        <span style={{ fontWeight: 600, color: "#23222A" }}>{j.employer_name || "Enterprise Employer"}</span>
                        <span>•</span>
                        <MapPin size={13} color="#706C64" />
                        <span>{j.city || j.district}{j.state ? `, ${j.state}` : ""}</span>
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {j.sector && <span className="badge badge-medium">{j.sector}</span>}
                      {j.employment_type && <span className="badge badge-low">{j.employment_type}</span>}
                      {j.is_synthetic && <span className="badge badge-demo">Calibrated Demo</span>}
                      {!j.is_active && <span className="badge" style={{ background: "#F3EFE8", color: "#9E9A91" }}>Archived</span>}
                    </div>
                  </div>

                  {/* Compensation & Experience Row */}
                  <div style={{
                    display: "flex",
                    gap: "1.5rem",
                    marginTop: "0.85rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid #F0ECE4",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}>
                    {(j.salary_min || j.salary_max) && (
                      <span style={{ fontSize: "0.82rem", color: "#9E783E", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        <IndianRupee size={13} />
                        ₹{j.salary_min ? (j.salary_min / 100000).toFixed(1) + "L" : "?"} – ₹{j.salary_max ? (j.salary_max / 100000).toFixed(1) + "L" : "?"} PA
                      </span>
                    )}

                    {j.experience_min_years !== null && (
                      <span style={{ fontSize: "0.82rem", color: "#706C64" }}>
                        👔 {j.experience_min_years}–{j.experience_max_years || "?"} yrs experience
                      </span>
                    )}

                    {j.education_requirement && (
                      <span style={{ fontSize: "0.82rem", color: "#706C64", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <GraduationCap size={13} color="#9E9A91" /> {j.education_requirement}
                      </span>
                    )}

                    {j.posting_date && (
                      <span style={{ fontSize: "0.78rem", color: "#9E9A91", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={12} /> {j.posting_date}
                      </span>
                    )}
                  </div>

                  {/* Skills tags */}
                  {j.skills_raw && (
                    <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "#9E9A91", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Skills:</span>
                      {j.skills_raw.split(",").slice(0, 8).map((s: string, idx: number) => (
                        <span key={idx} style={{
                          fontSize: "0.74rem",
                          padding: "2px 10px",
                          background: "#FAF8F5",
                          color: "#23222A",
                          borderRadius: 6,
                          border: "1px solid #E8E2D8",
                          fontWeight: 500,
                        }}>
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {jobs && jobs.total_pages > 1 && (
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", alignItems: "center" }}>
                <button
                  className="btn-secondary"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Previous
                </button>
                <span style={{ padding: "0.5rem 1rem", color: "#706C64", fontSize: "0.85rem", fontWeight: 600 }}>
                  Page {page} of {jobs.total_pages}
                </span>
                <button
                  className="btn-secondary"
                  onClick={() => setPage(p => Math.min(jobs.total_pages, p + 1))}
                  disabled={page === jobs.total_pages}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
