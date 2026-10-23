interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  color?: string;
  trend?: number;
  dark?: boolean;
}

export default function StatCard({ label, value, sub, icon, color = "#B89058", trend, dark = false }: Props) {
  if (dark) {
    return (
      <div className="card-dark" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 90, height: 90,
          background: "radial-gradient(circle at top right, rgba(184, 144, 88, 0.22), transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{
              fontSize: "0.72rem",
              color: "#D4AF37",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.45rem",
            }}>
              {label}
            </p>
            <p style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2.3rem",
              fontWeight: 700,
              color: "#FAF8F5",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}>
              {value}
            </p>
            {sub && <p style={{ fontSize: "0.76rem", color: "#B8B5AD", marginTop: "0.35rem" }}>{sub}</p>}
            {trend !== undefined && (
              <p style={{
                fontSize: "0.74rem",
                color: trend >= 0 ? "#68BA7F" : "#E06D6B",
                marginTop: "0.35rem",
                fontWeight: 600,
              }}>
                {trend >= 0 ? "▲ +" : "▼ "}{Math.abs(trend).toFixed(1)}% vs benchmark
              </p>
            )}
          </div>
          {icon && (
            <span style={{
              fontSize: "1.8rem",
              background: "rgba(184, 144, 88, 0.15)",
              border: "1px solid rgba(184, 144, 88, 0.3)",
              borderRadius: 8,
              padding: "0.35rem 0.6rem",
              lineHeight: 1,
            }}>
              {icon}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 80, height: 80,
        background: "radial-gradient(circle at top right, rgba(184, 144, 88, 0.12), transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{
            fontSize: "0.72rem",
            color: "#B89058",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "0.45rem",
          }}>
            {label}
          </p>
          <p style={{
            fontFamily: "var(--font-serif)",
            fontSize: "2.25rem",
            fontWeight: 700,
            color: "#23222A",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}>
            {value}
          </p>
          {sub && <p style={{ fontSize: "0.76rem", color: "#706C64", marginTop: "0.35rem" }}>{sub}</p>}
          {trend !== undefined && (
            <p style={{
              fontSize: "0.74rem",
              color: trend >= 0 ? "#4A7C59" : "#B83A38",
              marginTop: "0.35rem",
              fontWeight: 600,
            }}>
              {trend >= 0 ? "▲ +" : "▼ "}{Math.abs(trend).toFixed(1)}% vs benchmark
            </p>
          )}
        </div>
        {icon && (
          <span style={{
            fontSize: "1.75rem",
            background: "#FAF8F5",
            border: "1px solid #E8E2D8",
            borderRadius: 8,
            padding: "0.35rem 0.55rem",
            lineHeight: 1,
          }}>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
