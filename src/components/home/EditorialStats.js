export default function EditorialStats() {
  const stats = [
    {
      value: "< 28ms",
      label: "P95 RETRIEVAL LATENCY",
      detail: "In-memory HNSW cosine traversal",
    },
    {
      value: "AES-256",
      label: "BYOK VAULT ENCRYPTION",
      detail: "Authenticated GCM envelope security",
    },
    {
      value: "RRF k=60",
      label: "RECIPROCAL RANK FUSION",
      detail: "Dense vector + BM25 keyword blend",
    },
    {
      value: "100%",
      label: "ATLAS VECTOR NATIVE",
      detail: "Zero extra database infrastructure",
    },
  ];

  return (
    <section
      style={{
        borderTop: "1px solid var(--border-hairline)",
        borderBottom: "1px solid var(--border-hairline)",
        backgroundColor: "var(--bg-surface)",
        padding: "48px 0",
        position: "relative",
      }}
    >
      <div className="editorial-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "32px",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                borderLeft: "1px solid var(--border-hairline)",
                paddingLeft: "24px",
                position: "relative",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "36px",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                  marginBottom: "4px",
                }}
              >
                {stat.value.includes("28ms") ? (
                  <>
                    &lt; <span style={{ color: "var(--primary-red)" }}>28ms</span>
                  </>
                ) : stat.value.includes("AES-256") ? (
                  <>
                    AES-<span style={{ color: "var(--primary-red)" }}>256</span>
                  </>
                ) : stat.value.includes("RRF") ? (
                  <>
                    RRF <span style={{ color: "var(--primary-red)" }}>k=60</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: "var(--primary-red)" }}>100%</span> NATIVE
                  </>
                )}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-white)",
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-dim)",
                }}
              >
                {stat.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

