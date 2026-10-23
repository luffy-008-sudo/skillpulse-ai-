export default function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", gap: "1rem" }}>
      <div style={{
        width: 48, height: 48,
        border: "3px solid rgba(99,102,241,0.2)",
        borderTopColor: "#6366f1",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "#475569", fontSize: "0.875rem" }}>Loading SkillPulse AI…</p>
    </div>
  );
}
