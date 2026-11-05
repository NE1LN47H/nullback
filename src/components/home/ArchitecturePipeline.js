export default function ArchitecturePipeline() {
  const steps = [
    {
      num: "01",
      title: "Ingest & Validate",
      detail: "Magic-byte inspection (PDF, DOCX) + SSRF IP range blocklist",
      meta: "SECURITY LAYER",
    },
    {
      num: "02",
      title: "Clean & Chunk",
      detail: "NFKC normalization + Recursive boundary sliding window",
      meta: "SEMANTIC PARSER",
    },
    {
      num: "03",
      title: "BYOK Embedding",
      detail: "OpenAI / Voyage / Cohere batch vectorization (32 chunks)",
      meta: "AES-256 VAULT",
    },
    {
      num: "04",
      title: "Atlas Vector Store",
      detail: "HNSW compound vector index + fallback cosine similarity",
      meta: "PERSISTENCE",
    },
    {
      num: "05",
      title: "Hybrid RRF Query",
      detail: "Reciprocal Rank Fusion merges dense vectors + text ranks",
      meta: "< 28ms RETRIEVAL",
    },
  ];

  return (
    <section
      id="architecture"
      style={{
        padding: "90px 0",
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-hairline)",
        borderBottom: "1px solid var(--border-hairline)",
      }}
    >
      <div className="editorial-container">
        {/* Header */}
        <div style={{ marginBottom: "50px" }}>
          <span className="editorial-badge" style={{ marginBottom: "14px" }}>
            TOPOLOGY // DATA PIPELINE
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            The Nullback Pipeline Topology
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Deterministic document ingestion and hybrid vector retrieval pipeline flow.
          </p>
        </div>

        {/* Pipeline Steps Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {steps.map((step, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-hairline)",
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "var(--primary-red)",
                  }}
                >
                  {step.num}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.1em",
                    color: "var(--text-dim)",
                    border: "1px solid var(--border-hairline)",
                    padding: "2px 6px",
                  }}
                >
                  {step.meta}
                </span>
              </div>

              <h4
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: "8px",
                }}
              >
                {step.title}
              </h4>

              <p
                style={{
                  fontSize: "12px",
                  lineHeight: 1.5,
                  color: "var(--text-muted)",
                }}
              >
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

