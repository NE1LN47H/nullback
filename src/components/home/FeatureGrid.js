export default function FeatureGrid() {
  const features = [
    {
      spec: "SPEC // 01",
      title: "Semantic Recursive Chunking",
      desc: "Sliding-window chunker with dynamic token budget estimation. Respects paragraph, sentence, and code block boundaries to avoid truncated context and maintain semantic coherence.",
      code: "chunkSize: 512 | overlap: 64",
    },
    {
      spec: "SPEC // 02",
      title: "Hybrid Search & RRF Fusion",
      desc: "Blends dense vector cosine similarity with sparse text indexes using Reciprocal Rank Fusion. Catches exact identifiers and domain jargon that pure vector search misses.",
      code: "RRF(d) = Σ 1 / (60 + rank(d))",
    },
    {
      spec: "SPEC // 03",
      title: "BYOK Credential Vault",
      desc: "Bring Your Own Key for OpenAI, Voyage AI, or Cohere. Encrypted at rest with authenticated AES-256-GCM. Decrypted in-memory only during embedding generation and never logged.",
      code: "cipher: aes-256-gcm | iv: 16b",
    },
    {
      spec: "SPEC // 04",
      title: "Query Enhancer & Filtering",
      desc: "Strips conversational filler, resolves pronouns, and extracts core intent keywords before vector execution for maximum recall and minimal token waste.",
      code: "clean(q) → dedupe → vectorize",
    },
    {
      spec: "SPEC // 05",
      title: "MongoDB Atlas Native",
      desc: "Uses native $vectorSearch pipeline stages in production with automated fallback to exact in-memory cosine similarity for seamless local offline development.",
      code: "stage: $vectorSearch | index: vector_index",
    },
    {
      spec: "SPEC // 06",
      title: "Deep Telemetry & Observability",
      desc: "Track latency percentiles, document ingest statuses, token expenditure, and query volume per knowledge base with built-in analytics aggregations.",
      code: "metrics: p50/p95/p99 + request_logs",
    },
  ];

  return (
    <section id="features" style={{ padding: "90px 0" }}>
      <div className="editorial-container">
        {/* Section Header */}
        <div style={{ marginBottom: "56px" }}>
          <span className="editorial-badge" style={{ marginBottom: "16px" }}>
            SPECIFICATION // ARCHITECTURAL PILLARS
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4.5vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Engineered For Architectural <br />
            <span style={{ color: "var(--primary-red)" }}>Purity & Maximum Recall.</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "640px", lineHeight: 1.6 }}>
            No black-box magic or opaque wrappers. High-performance software engineering applied to enterprise
            retrieval-augmented generation.
          </p>
        </div>

        {/* 3-Column Editorial Grid */}
        <div className="editorial-grid-3">
          {features.map((item, idx) => (
            <div key={idx} className="editorial-card">
              <span className="spec-index">{item.spec}</span>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  marginBottom: "12px",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: 1.65,
                  color: "var(--text-muted)",
                  flex: 1,
                  marginBottom: "20px",
                }}
              >
                {item.desc}
              </p>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-dim)",
                  borderTop: "1px solid var(--border-hairline)",
                  paddingTop: "12px",
                }}
              >
                {item.code}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

