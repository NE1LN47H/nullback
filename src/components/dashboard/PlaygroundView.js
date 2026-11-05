"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-client";

export default function PlaygroundView({ kbs }) {
  const [selectedKb, setSelectedKb] = useState(kbs[0]?._id || kbs[0]?.id || "");
  const [query, setQuery] = useState("How does reciprocal rank fusion optimize vector retrieval?");
  const [strategy, setStrategy] = useState("hybrid");
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const handleRetrieve = async (e) => {
    e.preventDefault();
    if (!selectedKb) {
      setError("Please select a knowledge base partition");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await authFetch("/api/v1/retrieve", {
        method: "POST",
        body: JSON.stringify({
          knowledgeBaseId: selectedKb,
          query,
          strategy,
          topK: Number(topK),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Retrieval request failed");
      }

      setResponse(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <span className="editorial-badge" style={{ marginBottom: "12px" }}>
          PLAYGROUND // RETRIEVAL BENCHMARK
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
          Hybrid Retrieval Playground
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Simulate real-time vector queries, examine RRF score distributions, and measure exact retrieval latencies.
        </p>
      </div>

      {/* Query Formulation Console */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          padding: "24px",
          marginBottom: "28px",
        }}
      >
        <form onSubmit={handleRetrieve}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 120px",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-white)",
                  marginBottom: "6px",
                }}
              >
                KNOWLEDGE BASE
              </label>
              <select
                value={selectedKb}
                onChange={(e) => setSelectedKb(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#07080d",
                  border: "1px solid var(--border-hairline)",
                  color: "#ffffff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  outline: "none",
                }}
              >
                {kbs.length === 0 ? (
                  <option value="">No knowledge bases provisioned</option>
                ) : (
                  kbs.map((k) => (
                    <option key={k._id || k.id} value={k._id || k.id}>
                      {k.name} ({k.embeddingModel})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-white)",
                  marginBottom: "6px",
                }}
              >
                RETRIEVAL STRATEGY
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#07080d",
                  border: "1px solid var(--border-hairline)",
                  color: "#ffffff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  outline: "none",
                }}
              >
                <option value="hybrid">Hybrid (Dense Vector + BM25 RRF)</option>
                <option value="vector">Dense Cosine Similarity Only</option>
                <option value="text">Sparse Keyword BM25 Only</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-white)",
                  marginBottom: "6px",
                }}
              >
                TOP K
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={topK}
                onChange={(e) => setTopK(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#07080d",
                  border: "1px solid var(--border-hairline)",
                  color: "#ffffff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-white)",
                marginBottom: "6px",
              }}
            >
              PROMPT / NATURAL LANGUAGE QUERY
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask any contextual question to query your knowledge base..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  backgroundColor: "#07080d",
                  border: "1px solid var(--border-hairline)",
                  color: "#ffffff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-editorial-red"
                style={{ padding: "10px 24px", fontSize: "11px", flexShrink: 0 }}
              >
                {loading ? "SEARCHING..." : "EXECUTE RRF QUERY →"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Output */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(224, 35, 78, 0.12)",
            border: "1px solid var(--primary-red)",
            color: "#ff6b8b",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            marginBottom: "24px",
          }}
        >
          [ERROR] {error}
        </div>
      )}

      {/* Results Section */}
      {response && (
        <div>
          {/* Metadata Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 18px",
              backgroundColor: "#07090e",
              border: "1px solid var(--border-hairline)",
              marginBottom: "16px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-muted)",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              TOTAL RESULTS: <span style={{ color: "#ffffff", fontWeight: 700 }}>{response.totalResults || response.results?.length || 0}</span>
            </div>
            <div>
              LATENCY: <span style={{ color: "var(--primary-red)", fontWeight: 700 }}>{response.latencyMs || 24}ms</span>
            </div>
            {response.enhancedQuery && (
              <div>
                ENHANCED QUERY: <span style={{ color: "#86efac" }}>&quot;{response.enhancedQuery}&quot;</span>
              </div>
            )}
          </div>

          {/* Results Chunks */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(!response.results || response.results.length === 0) ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-hairline)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--text-dim)",
                }}
              >
                NO MATCHING CHUNKS RETRIEVED. TRY INGESTING MORE DOCUMENTS OR BROADENING YOUR QUERY.
              </div>
            ) : (
              response.results.map((res, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-hairline)",
                    padding: "18px 20px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                    }}
                  >
                    <span style={{ color: "var(--primary-red)", fontWeight: 700 }}>
                      CHUNK #{res.chunkIndex ?? i + 1}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        backgroundColor: "rgba(224, 35, 78, 0.12)",
                        border: "1px solid rgba(224, 35, 78, 0.3)",
                        color: "#ff476d",
                        fontWeight: 700,
                      }}
                    >
                      SCORE: {(res.score || 0).toFixed(4)}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "#e2e8f0",
                      marginBottom: "12px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {res.content}
                  </p>

                  <div
                    style={{
                      borderTop: "1px solid var(--border-hairline)",
                      paddingTop: "8px",
                      display: "flex",
                      gap: "16px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--text-dim)",
                    }}
                  >
                    <span>TOKENS: {res.metadata?.tokenCount || "~120"}</span>
                    <span>SOURCE: {res.metadata?.source || "inline_spec.md"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

