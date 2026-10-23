export default function ErrorState({
  message = "Unable to retrieve labour intelligence data.",
  retry,
}: {
  message?: string;
  retry?: () => void;
}) {
  return (
    <div style={{
      background: "#FFF8F7",
      border: "1px solid rgba(184, 58, 56, 0.3)",
      borderRadius: "12px",
      padding: "2.5rem 2rem",
      textAlign: "center",
      maxWidth: 520,
      margin: "3rem auto",
      boxShadow: "0 4px 20px rgba(184, 58, 56, 0.05)",
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "rgba(184, 58, 56, 0.1)",
        color: "#B83A38",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.25rem",
        margin: "0 auto 1rem",
      }}>
        !
      </div>
      <h3 style={{
        fontFamily: "var(--font-serif)",
        fontSize: "1.2rem",
        color: "#23222A",
        marginBottom: "0.5rem",
      }}>
        Intelligence Service Notice
      </h3>
      <p style={{ fontSize: "0.85rem", color: "#706C64", lineHeight: 1.5, marginBottom: "1.5rem" }}>
        {message}
      </p>
      {retry && (
        <button
          className="btn-primary"
          onClick={retry}
          style={{ margin: "0 auto" }}
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}
