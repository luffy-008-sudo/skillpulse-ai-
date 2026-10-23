"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import StatCard from "@/components/StatCard";
import DemoWarning from "@/components/DemoWarning";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, Award, Building2, MapPin, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

// Roos Breez / Anthony Fell Harmonized Palette for Visualizations
const CHART_COLORS = [
  "#B89058", // Antique Gold
  "#2B2A33", // Deep Charcoal
  "#4A7C59", // Muted Forest Sage
  "#BD7222", // Amber Bronze
  "#3D6B80", // Slate Teal
  "#8C7B6E", // Warm Cashmere Taupe
  "#B83A38", // Terracotta Coral
  "#505A69", // Antique Indigo
];

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    api.filterOptions().then(setFilters).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.overview(stateFilter || undefined, sectorFilter || undefined)
      .then(setData)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [stateFilter, sectorFilter]);

  if (loading) return <div style={{ padding: "4rem 2rem", maxWidth: 1400, margin: "0 auto" }}><LoadingSpinner /></div>;
  if (error) return <div style={{ padding: "4rem 2rem", maxWidth: 1400, margin: "0 auto" }}><ErrorState message={error} /></div>;
  if (!data) return null;

  const { overview, top_skills, top_sectors, salary_distribution, monthly_trend, state_distribution } = data;

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      {/* 1. EDITORIAL HERO BANNER (Dark Anthracite with Gold Accents) */}
      <section style={{
        background: "linear-gradient(180deg, #2B2A33 0%, #23222A 100%)",
        color: "#FAF8F5",
        padding: "3.5rem 1.5rem 3rem",
        borderBottom: "1px solid rgba(184, 144, 88, 0.3)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle radial luxury glow */}
        <div style={{
          position: "absolute",
          top: -60,
          right: "10%",
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(184, 144, 88, 0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "4px 12px",
            borderRadius: 999,
            background: "rgba(184, 144, 88, 0.15)",
            border: "1px solid rgba(184, 144, 88, 0.35)",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "#D4AF37",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            <Sparkles size={12} /> National Labour Market Intelligence Engine
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "2rem",
            marginBottom: "2.5rem",
          }}>
            <div>
              <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 3.5vw, 2.85rem)",
                fontWeight: 700,
                color: "#FAF8F5",
                lineHeight: 1.15,
                marginBottom: "0.6rem",
                letterSpacing: "-0.015em",
              }}>
                Labour Market Intelligence Overview
              </h1>
              <p style={{
                color: "#CDC9C1",
                fontSize: "0.98rem",
                maxWidth: 720,
                lineHeight: 1.6,
                fontWeight: 400,
              }}>
                Continuous macro-monitoring of active job requisitions, hiring momentum, and real-time skill demand across India&apos;s priority sectors.
              </p>
            </div>

            {/* Filter Controls (Styled in Luxury Off-White & Dark Gold) */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "0.5rem 0.85rem",
              borderRadius: 10,
              flexWrap: "wrap",
            }}>
              <select
                value={stateFilter}
                onChange={e => setStateFilter(e.target.value)}
                style={{
                  background: "#212027",
                  border: "1px solid rgba(184, 144, 88, 0.4)",
                  color: "#FAF8F5",
                  minWidth: 150,
                  fontSize: "0.82rem",
                }}
              >
                <option value="">All Indian States</option>
                {(filters.states || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>

              <select
                value={sectorFilter}
                onChange={e => setSectorFilter(e.target.value)}
                style={{
                  background: "#212027",
                  border: "1px solid rgba(184, 144, 88, 0.4)",
                  color: "#FAF8F5",
                  minWidth: 180,
                  fontSize: "0.82rem",
                }}
              >
                <option value="">All Industry Sectors</option>
                {(filters.sectors || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>

              {(stateFilter || sectorFilter) && (
                <button
                  onClick={() => { setStateFilter(""); setSectorFilter(""); }}
                  style={{
                    background: "rgba(184, 144, 88, 0.2)",
                    border: "1px solid #B89058",
                    color: "#D4AF37",
                    borderRadius: 6,
                    padding: "0.45rem 0.85rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* 5 KPI Stat Cards in Minimalist Charcoal/Gold Frame */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "1.25rem",
          }}>
            <StatCard
              label="Total Job Postings"
              value={overview.total_jobs?.toLocaleString()}
              sub="Indexed across national sources"
              icon="📋"
              dark={true}
            />
            <StatCard
              label="Active Postings"
              value={overview.active_jobs?.toLocaleString()}
              sub="Actively recruiting now"
              icon="⚡"
              dark={true}
            />
            <StatCard
              label="Skills Monitored"
              value={overview.total_skills_tracked?.toLocaleString()}
              sub="Categorised by NCO-2015"
              icon="🎯"
              dark={true}
            />
            <StatCard
              label="Sectors Covered"
              value={overview.total_sectors}
              sub="High-priority MSDE sectors"
              icon="🏭"
              dark={true}
            />
            <StatCard
              label="States & UTs"
              value={overview.total_states_covered}
              sub="Nationwide geographic spread"
              icon="🗺️"
              dark={true}
            />
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT CANVAS (Warm Ivory / Minimalist Alabaster) */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {overview?.is_demo_mode && <DemoWarning />}

        {/* Primary Analytical Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.75fr 1fr",
          gap: "1.75rem",
          marginBottom: "2rem",
        }}>
          {/* Monthly Job Posting Trend */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.25rem" }}>
              <div>
                <p className="section-kicker">Macro Hiring Velocity</p>
                <h2 className="section-title" style={{ margin: 0 }}>Monthly Job Posting Trend</h2>
              </div>
              <span style={{ fontSize: "0.78rem", color: "#B89058", fontWeight: 600 }}>
                12-Month Historical Series
              </span>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthly_trend || []}>
                <defs>
                  <linearGradient id="goldTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B89058" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#B89058" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFECE4" />
                <XAxis dataKey="period" tick={{ fill: "#706C64", fontSize: 11, fontFamily: "var(--font-sans)" }} />
                <YAxis tick={{ fill: "#706C64", fontSize: 11, fontFamily: "var(--font-sans)" }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#B89058"
                  fill="url(#goldTrendGrad)"
                  strokeWidth={2.5}
                  name="Job Postings"
                  dot={{ fill: "#2B2A33", stroke: "#B89058", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: "#B89058" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Salary Distribution */}
          <div className="card">
            <div style={{ marginBottom: "1.25rem" }}>
              <p className="section-kicker">Compensation Tiers</p>
              <h2 className="section-title" style={{ margin: 0 }}>Salary Distribution (INR LPA)</h2>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salary_distribution || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#EFECE4" />
                <XAxis type="number" tick={{ fill: "#706C64", fontSize: 10 }} />
                <YAxis dataKey="range_label" type="category" tick={{ fill: "#23222A", fontSize: 11, fontWeight: 500 }} width={75} />
                <Tooltip formatter={(v: any) => [`${v}%`, "Share"]} />
                <Bar dataKey="percentage" fill="#2B2A33" radius={[0, 4, 4, 0]} name="% Jobs">
                  {(salary_distribution || []).map((_: any, idx: number) => (
                    <Cell key={idx} fill={idx === 1 || idx === 2 ? "#B89058" : "#2B2A33"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. DARK STATEMENT FEATURE BANNER (Alternating Contrast Band from 99designs concept) */}
        <div className="card-dark" style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "2rem",
          background: "linear-gradient(135deg, #2B2A33 0%, #201F26 100%)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{
                color: "#D4AF37",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                Strategic Intelligence Callout
              </span>
            </div>
            <h3 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.65rem",
              color: "#FAF8F5",
              marginBottom: "0.5rem",
              letterSpacing: "-0.01em",
            }}>
              Anticipate Emerging Skill Deficits Ahead of Market Disruption
            </h3>
            <p style={{ color: "#B8B5AD", fontSize: "0.9rem", maxWidth: 750, lineHeight: 1.6 }}>
              Cross-referencing 5,000+ job demands against NSDC training admissions exposes severe shortfalls in Cloud Architecture, Embedded IoT, and Advanced AI Engineering over the next 24 months.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <Link href="/forecast" className="btn-gold" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              Explore Forecasts <ArrowRight size={14} />
            </Link>
            <Link href="/gaps" className="btn-primary" style={{ textDecoration: "none", background: "transparent", border: "1px solid rgba(255,255,255,0.2)" }}>
              View Gap Matrix
            </Link>
          </div>
        </div>

        {/* Secondary Analytical Grid (3 Columns) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "1.75rem",
        }}>
          {/* Top In-Demand Skills */}
          <div className="card">
            <div style={{ marginBottom: "1.25rem" }}>
              <p className="section-kicker">Skill Frequency</p>
              <h2 className="section-title" style={{ margin: 0 }}>Top In-Demand Competencies</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {(top_skills || []).slice(0, 10).map((s: any, i: number) => (
                <div key={s.skill_name} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{
                    fontFamily: "var(--font-serif)",
                    color: i < 3 ? "#B89058" : "#9E9A91",
                    fontWeight: 700,
                    minWidth: 24,
                    fontSize: "0.95rem",
                  }}>
                    #{i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: "0.85rem", color: "#23222A", fontWeight: 600 }}>{s.skill_name}</span>
                      {s.is_emerging && (
                        <span className="badge badge-medium" style={{ fontSize: "0.62rem" }}>
                          Emerging
                        </span>
                      )}
                    </div>
                    <div style={{ background: "#F0ECE4", borderRadius: 4, height: 5, overflow: "hidden" }}>
                      <div style={{
                        background: i < 3
                          ? "linear-gradient(90deg, #B89058, #CBA369)"
                          : "#2B2A33",
                        height: "100%",
                        width: `${Math.min(100, (s.job_count / (top_skills?.[0]?.job_count || 1)) * 100)}%`,
                        borderRadius: 4,
                      }} />
                    </div>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#706C64", minWidth: 45, textAlign: "right", fontWeight: 500 }}>
                    {s.job_count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Hiring Sectors */}
          <div className="card">
            <div style={{ marginBottom: "1.25rem" }}>
              <p className="section-kicker">Industry Distribution</p>
              <h2 className="section-title" style={{ margin: 0 }}>Primary Hiring Sectors</h2>
            </div>

            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie
                  data={(top_sectors || []).slice(0, 8)}
                  dataKey="job_count"
                  nameKey="sector"
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {(top_sectors || []).slice(0, 8).map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="#FFFFFF" strokeWidth={1.5} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  formatter={(v) => <span style={{ color: "#706C64", fontSize: "0.72rem", fontWeight: 500 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Jobs by State */}
          <div className="card">
            <div style={{ marginBottom: "1.25rem" }}>
              <p className="section-kicker">Regional Distribution</p>
              <h2 className="section-title" style={{ margin: 0 }}>National Geography Spread</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", maxHeight: 310, overflowY: "auto" }} className="scrollbar-thin">
              {(state_distribution || []).map((s: any, i: number) => (
                <div key={s.state} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ color: "#9E9A91", fontSize: "0.78rem", minWidth: 20 }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: "0.85rem", color: "#23222A", fontWeight: 500 }}>{s.state}</span>
                      <span style={{ fontSize: "0.78rem", color: "#706C64", fontWeight: 600 }}>{s.job_count.toLocaleString()}</span>
                    </div>
                    <div style={{ background: "#F0ECE4", borderRadius: 4, height: 4, overflow: "hidden" }}>
                      <div style={{
                        background: CHART_COLORS[i % CHART_COLORS.length],
                        height: "100%",
                        width: `${Math.min(100, (s.job_count / (state_distribution?.[0]?.job_count || 1)) * 100)}%`,
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
