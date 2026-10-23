export default function DemoWarning() {
  return (
    <div style={{
      background: "#FDFBF7",
      border: "1px solid rgba(184, 144, 88, 0.45)",
      borderRadius: "10px",
      padding: "0.9rem 1.25rem",
      marginBottom: "1.75rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      boxShadow: "0 2px 10px rgba(184, 144, 88, 0.08)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{
          background: "#B89058",
          color: "#FAF8F5",
          fontSize: "0.7rem",
          fontWeight: 800,
          padding: "2px 8px",
          borderRadius: 4,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          Demo Mode
        </span>
        <p style={{ fontSize: "0.82rem", color: "#684F25", margin: 0, lineHeight: 1.4 }}>
          Currently displaying calibrated synthetic & historic labour intelligence data (5,000 baseline jobs) for demonstration purposes.
        </p>
      </div>
      <span style={{ fontSize: "0.75rem", color: "#9E783E", fontWeight: 600, whiteSpace: "nowrap" }}>
        Production Ingestion Active
      </span>
    </div>
  );
}
