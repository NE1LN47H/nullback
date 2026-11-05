"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-client";

export default function DocumentsView({ documents, kbs, refreshDocs }) {
  const [showIngest, setShowIngest] = useState(false);
  const [selectedKb, setSelectedKb] = useState(kbs[0]?._id || kbs[0]?.id || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!selectedKb) {
      setError("Please select a valid Knowledge Base partition");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create document entry
      const res = await authFetch("/api/v1/documents", {
        method: "POST",
        body: JSON.stringify({
          knowledgeBaseId: selectedKb,
          title,
          content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Document creation failed");
      }

      const docId = data.data?._id || data.data?.id || data.data?.document?._id;

      // 2. Trigger automated processing / chunking pipeline
      if (docId) {
        setProcessingId(docId);
        await authFetch(`/api/v1/documents/${docId}/process`, {
          method: "POST",
        });
      }

      setTitle("");
      setContent("");
      setShowIngest(false);
      refreshDocs();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  const handleProcessManual = async (docId) => {
    setProcessingId(docId);
    try {
      await authFetch(`/api/v1/documents/${docId}/process`, {
        method: "POST",
      });
      refreshDocs();
    } catch (err) {
      alert("Processing error: " + err.message);
    } finally {
      setProcessingId(null);
    }
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
            INGESTION // SEMANTIC PIPELINE
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
            Document Ingestion
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Normalize text, generate recursive sliding-window chunks, and embed into Atlas vector search.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowIngest(!showIngest)}
          className="btn-editorial-red"
          style={{ padding: "10px 18px", fontSize: "11px" }}
        >
          {showIngest ? "CANCEL" : "+ INGEST NEW DOCUMENT"}
        </button>
      </div>

      {/* Ingestion Box */}
      {showIngest && (
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            padding: "28px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "20px",
            }}
          >
            INGEST & CHUNK RAW TEXT / SPECIFICATION
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

          <form onSubmit={handleIngest}>
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
                  TARGET KNOWLEDGE BASE
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
                  {kbs.map((k) => (
                    <option key={k._id || k.id} value={k._id || k.id}>
                      {k.name} ({k.embeddingModel})
                    </option>
                  ))}
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
                  DOCUMENT TITLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. system_architecture_v2.md"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                DOCUMENT CONTENT (TEXT / MARKDOWN)
              </label>
              <textarea
                required
                rows={6}
                placeholder="Paste document text here. Nullback will normalize unicode (NFKC), strip control characters, and execute recursive sliding-window chunking..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#07080d",
                  border: "1px solid var(--border-hairline)",
                  color: "#ffffff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  lineHeight: 1.5,
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-editorial-red"
              style={{ padding: "10px 20px", fontSize: "11px" }}
            >
              {loading ? "PROCESSING & EMBEDDING..." : "EXECUTE INGESTION PIPELINE →"}
            </button>
          </form>
        </div>
      )}

      {/* Documents Table */}
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
          <div>TITLE / ID</div>
          <div>CHARACTERS</div>
          <div>CHUNKS</div>
          <div>PIPELINE STATUS</div>
          <div>ACTION</div>
        </div>

        {documents.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}
          >
            NO DOCUMENTS INGESTED YET. CLICK &quot;+ INGEST NEW DOCUMENT&quot; TO RUN CHUNKING.
          </div>
        ) : (
          documents.map((doc) => {
            const isProcessing = processingId === (doc._id || doc.id);
            return (
              <div
                key={doc._id || doc.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 100px",
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border-hairline)",
                  alignItems: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                }}
              >
                <div>
                  <div style={{ color: "#ffffff", fontWeight: 700, marginBottom: "4px" }}>
                    {doc.title || "Untitled Document"}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>
                    {doc._id || doc.id}
                  </div>
                </div>

                <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                  {doc.characterCount || doc.content?.length || 0} chars
                </div>

                <div style={{ color: "var(--text-white)", fontWeight: 700, fontSize: "11px" }}>
                  {doc.chunkCount || 0} chunks
                </div>

                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "3px 8px",
                      backgroundColor:
                        doc.status === "completed"
                          ? "rgba(22, 101, 52, 0.2)"
                          : "rgba(234, 179, 8, 0.15)",
                      border: `1px solid ${
                        doc.status === "completed" ? "rgba(34, 197, 94, 0.3)" : "rgba(234, 179, 8, 0.4)"
                      }`,
                      color: doc.status === "completed" ? "#86efac" : "#facc15",
                      fontSize: "10px",
                    }}
                  >
                    {isProcessing ? "PROCESSING..." : (doc.status || "COMPLETED").toUpperCase()}
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleProcessManual(doc._id || doc.id)}
                    disabled={isProcessing}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border-hairline)",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      padding: "4px 8px",
                      cursor: isProcessing ? "wait" : "pointer",
                    }}
                  >
                    RE-CHUNK
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
