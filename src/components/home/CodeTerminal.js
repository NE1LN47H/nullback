"use client";

import { useState } from "react";

export default function CodeTerminal() {
  const [activeTab, setActiveTab] = useState("curl");
  const [copied, setCopied] = useState(false);

  const curlCode = `# Unified HTTP context retrieval with hybrid Reciprocal Rank Fusion
curl -X POST https://api.nullback.dev/api/v1/retrieve \\
  -H "Authorization: Bearer nb_live_8f9e12c93..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "knowledgeBaseId": "kb_prod_atlas_01",
    "query": "How does reciprocal rank fusion optimize vector retrieval?",
    "topK": 5,
    "strategy": "hybrid"
  }'`;

  const sdkCode = `import { NullbackClient } from "@nullback/sdk";

// Initialize client with authenticated session or API Key
const nullback = new NullbackClient({
  apiKey: process.env.NULLBACK_API_KEY,
});

// Execute hybrid vector search + BM25 keyword fusion
const { results, latencyMs } = await nullback.retrieve({
  knowledgeBaseId: "kb_prod_atlas_01",
  query: "How does reciprocal rank fusion optimize vector retrieval?",
  topK: 5,
  strategy: "hybrid",
});

console.log(\`[NULLBACK] Retrieved \${results.length} chunks in \${latencyMs}ms\`);`;

  const responseCode = `{
  "success": true,
  "query": "How does reciprocal rank fusion optimize vector retrieval?",
  "enhancedQuery": "reciprocal rank fusion RRF optimize vector hybrid retrieval",
  "totalResults": 5,
  "latencyMs": 24,
  "results": [
    {
      "chunkIndex": 3,
      "score": 0.9421,
      "content": "Reciprocal Rank Fusion (RRF) merges dense vector similarity scores with BM25 sparse keyword rankings, preventing out-of-domain degradation and ensuring both semantic and exact keyword match precision.",
      "metadata": {
        "source": "vector-architecture-v2.pdf",
        "page": 14,
        "tokenCount": 384
      }
    }
  ]
}`;

  const getCode = () => {
    switch (activeTab) {
      case "sdk":
        return sdkCode;
      case "response":
        return responseCode;
      case "curl":
      default:
        return curlCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="api-terminal" style={{ paddingBottom: "80px" }}>
      <div className="editorial-container" style={{ maxWidth: "1000px" }}>
        <div className="terminal-frame">
          {/* Header */}
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>

            {/* Tab switchers */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className={`terminal-tab-btn ${activeTab === "curl" ? "active" : ""}`}
                onClick={() => setActiveTab("curl")}
              >
                01. cURL / REST
              </button>
              <button
                type="button"
                className={`terminal-tab-btn ${activeTab === "sdk" ? "active" : ""}`}
                onClick={() => setActiveTab("sdk")}
              >
                02. JS SDK
              </button>
              <button
                type="button"
                className={`terminal-tab-btn ${activeTab === "response" ? "active" : ""}`}
                onClick={() => setActiveTab("response")}
              >
                03. RRF RESPONSE
              </button>
            </div>

            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: "transparent",
                border: "none",
                color: copied ? "#86efac" : "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.05em",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  <span>COPY CODE</span>
                </>
              )}
            </button>
          </div>

          {/* Terminal Code Body */}
          <div className="terminal-code">
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              <code>{getCode()}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

