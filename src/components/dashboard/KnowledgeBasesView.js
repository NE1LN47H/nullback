"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-client";

export default function KnowledgeBasesView({ kbs, refreshKbs, onSelectKb }) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [embeddingModel, setEmbeddingModel] = useState("text-embedding-3-small");
  const [embeddingDimensions, setEmbeddingDimensions] = useState(1536);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleModelChange = (model) => {
    setEmbeddingModel(model);
    if (model === "text-embedding-3-small") setEmbeddingDimensions(1536);
    else if (model === "text-embedding-3-large") setEmbeddingDimensions(3072);
    else if (model.startsWith("voyage")) setEmbeddingDimensions(1024);
    else if (model.startsWith("embed-")) setEmbeddingDimensions(1024);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch("/api/v1/knowledge-bases", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          embeddingModel,
          embeddingDimensions: Number(embeddingDimensions),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create knowledge base");
      }

      setName("");
      setDescription("");
      setShowCreate(false);
      refreshKbs();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <span className="editorial-badge" style={{ marginBottom: "12px" }}>
            INDEX // PARTITIONING
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
            Knowledge Bases
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Isolated vector search partitions with custom embedding configurations and HNSW indexes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="btn-editorial-red"
          style={{ padding: "10px 18px", fontSize: "11px" }}
        >
          {showCreate ? "CANCEL" : "+ CREATE KNOWLEDGE BASE"}
        </button>
      </div>

      {/* Creation Modal / Inline Box */}
      {showCreate && (
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            padding: "28px",
            marginBottom: "32px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "0.06em",
              marginBottom: "20px",
            }}
          >
            INITIALIZE NEW KNOWLEDGE BASE PARTITION
          </div>

          {error && (
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: "rgba(224, 35, 78, 0.12)",
                border: "1px solid var(--primary-red)",
                color: "#ff6b8b",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleCreate}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
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
                  KNOWLEDGE BASE NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal Compliance Docs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  EMBEDDING MODEL
                </label>
                <select
                  value={embeddingModel}
                  onChange={(e) => handleModelChange(e.target.value)}
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
                  <option value="text-embedding-3-small">OpenAI text-embedding-3-small (1536d)</option>
                  <option value="text-embedding-3-large">OpenAI text-embedding-3-large (3072d)</option>
                  <option value="voyage-3-lite">Voyage AI voyage-3-lite (1024d)</option>
                  <option value="embed-english-v3.0">Cohere embed-english-v3.0 (1024d)</option>
                </select>
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
                DESCRIPTION
              </label>
              <input
                type="text"
                placeholder="Enterprise documentation index for hybrid RAG"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="btn-editorial-red"
              style={{ padding: "10px 20px", fontSize: "11px" }}
            >
              {loading ? "PROVISIONING..." : "INITIALIZE PARTITION →"}
            </button>
          </form>
        </div>
      )}

      {/* Table / List */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-hairline)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 100px",
            padding: "14px 20px",
            borderBottom: "1px solid var(--border-hairline)",
            backgroundColor: "#07080d",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: "var(--text-dim)",
          }}
        >
          <div>IDENTIFIER / NAME</div>
          <div>MODEL</div>
          <div>DIMENSIONS</div>
          <div>STATUS</div>
          <div>ACTION</div>
        </div>

        {kbs.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}
          >
            NO KNOWLEDGE BASES PROVISIONED YET. INITIALIZE ONE ABOVE TO BEGIN.
          </div>
        ) : (
          kbs.map((kb) => (
            <div
              key={kb._id || kb.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 100px",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-hairline)",
                alignItems: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div>
                <div style={{ color: "#ffffff", fontWeight: 700, marginBottom: "4px" }}>{kb.name}</div>
                <div
                  onClick={() => handleCopy(kb._id || kb.id)}
                  style={{
                    fontSize: "10px",
                    color: "var(--text-dim)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  title="Click to copy ID"
                >
                  <span>{kb._id || kb.id}</span>
                  <span style={{ color: copiedId === (kb._id || kb.id) ? "#86efac" : "var(--primary-red)" }}>
                    {copiedId === (kb._id || kb.id) ? "✓" : "copy"}
                  </span>
                </div>
              </div>

              <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                {kb.embeddingModel || "text-embedding-3-small"}
              </div>

              <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                {kb.embeddingDimensions || 1536}d
              </div>

              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "3px 8px",
                    backgroundColor: "rgba(22, 101, 52, 0.2)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    color: "#86efac",
                    fontSize: "10px",
                  }}
                >
                  READY
                </span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => onSelectKb && onSelectKb(kb._id || kb.id)}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border-hairline)",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary-red)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-hairline)")}
                >
                  SELECT →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

