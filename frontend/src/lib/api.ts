const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

function qs(params: Record<string, any>): string {
  const p = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return p.length ? `?${p.join("&")}` : "";
}

export const api = {
  overview: (state?: string, sector?: string) =>
    req<any>(`/api/dashboard/overview${qs({ state, sector })}`),
  topSkills: (state?: string, sector?: string, limit = 15) =>
    req<any[]>(`/api/dashboard/top-skills${qs({ state, sector, limit })}`),
  topSectors: (state?: string) =>
    req<any[]>(`/api/dashboard/top-sectors${qs({ state })}`),
  stateDistribution: (sector?: string) =>
    req<any[]>(`/api/dashboard/state-distribution${qs({ sector })}`),
  salaryDistribution: (sector?: string, state?: string) =>
    req<any[]>(`/api/dashboard/salary-distribution${qs({ sector, state })}`),
  monthlyTrend: (months = 12, sector?: string, state?: string) =>
    req<any[]>(`/api/dashboard/monthly-trend${qs({ months, sector, state })}`),
  skillTrend: (skillName: string, state?: string, months = 36) =>
    req<any[]>(`/api/dashboard/skill-trend/${encodeURIComponent(skillName)}${qs({ state, months })}`),
  forecast: (forecastType: string, targetName: string, state?: string, horizonMonths = 12) =>
    req<any>(`/api/forecast/predict${qs({ forecast_type: forecastType, target_name: targetName, state, horizon_months: horizonMonths })}`),
  emergingSkills: (limit = 20) =>
    req<any[]>(`/api/forecast/emerging-skills${qs({ limit })}`),
  sectorGrowth: () => req<any[]>("/api/forecast/sector-growth"),
  modelEvaluations: () => req<any[]>("/api/forecast/model-evaluations"),
  gapAnalysis: (params: Record<string, any>) =>
    req<any>(`/api/gaps/analysis${qs(params)}`),
  simulate: (body: any) =>
    req<any>("/api/gaps/simulate", { method: "POST", body: JSON.stringify(body) }),
  recommendations: (sector?: string, state?: string, priority?: string) =>
    req<any[]>(`/api/gaps/recommendations${qs({ sector, state, priority })}`),
  gapSummary: () => req<any>("/api/gaps/summary"),
  searchJobs: (params: Record<string, any>) =>
    req<any>(`/api/jobs/search${qs(params)}`),
  filterOptions: () => req<any>("/api/jobs/filters"),
  dataSources: () => req<any[]>("/api/data/sources"),
  ingestionLogs: () => req<any[]>("/api/data/ingestion-logs"),
  freeApiSources: () => req<any>("/api/data/free-api-sources"),
  importNaukriStatic: () =>
    req<any>("/api/data/import-naukri-static", { method: "POST" }),
  uploadCsv: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch(`${BASE}/api/data/upload-csv`, { method: "POST", body: fd }).then(r => r.json());
  },
  health: () => req<any>("/api/health"),
  config: () => req<any>("/api/config"),
};
