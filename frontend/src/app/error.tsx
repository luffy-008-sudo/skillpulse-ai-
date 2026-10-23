"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</p>
      <h2 style={{ color: "#f87171", marginBottom: "0.5rem" }}>Something went wrong</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>{error.message}</p>
      <button className="btn-primary" onClick={reset}>Try again</button>
    </div>
  );
}
