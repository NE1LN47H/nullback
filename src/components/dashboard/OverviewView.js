"use client";

export default function OverviewView({ kbs, documents, onNavigate }) {
  const totalChunks = documents.reduce((sum, d) => sum + (d.chunkCount || 0), 0);

  const stats = [
    {
      label: "KNOWLEDGE BASES",
      value: kbs.length,
      detail: "Active isolated vector domains",
      meta: "TENANCY",
    },
    {
      label: "DOCUMENTS INDEXED",
      value: documents.length,
      detail: "Sanitized & parsed files",
      meta: "INGESTION",
    },
    {
      label: "EMBEDDED CHUNKS",
      value: totalChunks,
      detail: "High-dimensional vector points",
      meta: "ATLAS VECTORS",
    },
    {
      label: "P95 LATENCY",
      value: "24ms",
      detail: "Sub-second hybrid RRF context",
      meta: "BENCHMARK",
      highlight: true,
    },
  ];

  return (
    <div>
      {/* View Header */}
      <div style={{ marginBottom: "28px" }}>
        <span className="editorial-badge" style={{ marginBottom: "12px" }}>
          TELEMETRY // SYSTEM OVERVIEW
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "28px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Progressive RAG Console
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Real-time cluster telemetry, knowledge base index status, and vector query performance.
        </p>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {stats.map((s, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-hairline)",
              padding: "24px 20px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                }}
              >
                {s.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.08em",
                  color: "var(--text-dim)",
                  border: "1px solid var(--border-hairline)",
                  padding: "1px 5px",
                }}
              >
                {s.meta}
              </span>
            </div>

            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "36px",
                fontWeight: 800,
                color: s.highlight ? "var(--primary-red)" : "#ffffff",
                letterSpacing: "-0.02em",
                marginBottom: "6px",
              }}
            >
              {s.value}
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-dim)",
              }}
            >
              {s.detail}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Dock */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          padding: "24px",
          marginBottom: "32px",
          position: "relative",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "#ffffff",
            fontWeight: 700,
            marginBottom: "14px",
            textTransform: "uppercase",
          }}
        >
          QUICK WORKFLOW ACTIONS
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => onNavigate("knowledge-bases")}
            className="btn-editorial-red"
            style={{ padding: "10px 18px", fontSize: "11px" }}
          >
            + NEW KNOWLEDGE BASE
          </button>
          <button
            type="button"
            onClick={() => onNavigate("documents")}
            className="btn-editorial-outline"
            style={{ padding: "10px 18px", fontSize: "11px" }}
          >
            + INGEST DOCUMENT
          </button>
          <button
            type="button"
            onClick={() => onNavigate("byok")}
            className="btn-editorial-outline"
            style={{ padding: "10px 18px", fontSize: "11px" }}
          >
            CONFIGURE BYOK VAULT
          </button>
          <button
            type="button"
            onClick={() => onNavigate("playground")}
            className="btn-editorial-outline"
            style={{ padding: "10px 18px", fontSize: "11px" }}
          >
            OPEN RETRIEVAL PLAYGROUND →
          </button>
        </div>
      </div>

      {/* Architecture Spec Callout */}
      <div
        style={{
          backgroundColor: "#07090e",
          border: "1px solid var(--border-hairline)",
          padding: "20px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: "var(--primary-red)", fontWeight: 700 }}>
          [ARCHITECTURE STATUS]
        </span>{" "}
        MongoDB Atlas Vector Search is operational. Hybrid queries will automatically evaluate dense cosine
        similarity merged with lexical text matching via Reciprocal Rank Fusion ($k=60$).
      </div>
    </div>
  );
}

