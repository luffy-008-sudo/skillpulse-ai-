export default function LoadingSpinner({ message = "Loading labour market intelligence..." }: { message?: string }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "4rem 2rem",
      gap: "1.25rem",
    }}>
      <div style={{
        width: 44,
        height: 44,
        border: "3px solid #E8E2D8",
        borderTopColor: "#B89058",
        borderRadius: "50%",
        animation: "spin 0.9s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{
        fontSize: "0.88rem",
        color: "#706C64",
        fontWeight: 500,
        letterSpacing: "0.02em",
      }}>
        {message}
      </p>
    </div>
  );
}
