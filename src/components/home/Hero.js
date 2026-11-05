"use client";

import { useState } from "react";
import Link from "next/link";

export default function Hero() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      'curl -X POST https://api.nullback.dev/api/v1/retrieve -H "Authorization: Bearer nb_live_..."'
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section style={{ paddingTop: "80px", paddingBottom: "60px", position: "relative" }}>
      <div className="editorial-container" style={{ textAlign: "center", maxWidth: "900px" }}>
        {/* Tech Editorial Spec Header */}
        <div style={{ marginBottom: "26px" }}>
          <span className="editorial-badge">
            <span className="editorial-status-dot"></span>
            SPEC // PROGRESSIVE RAG ENGINE • EDITION 2026.1
          </span>
        </div>

        {/* Syne Editorial Headline */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(38px, 6vw, 68px)",
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          RAG Infrastructure <br />
          <span
            style={{
              color: "var(--primary-red)",
              textShadow: "0 0 30px rgba(224, 35, 78, 0.4)",
            }}
          >
            Engineered For Speed.
          </span>
        </h1>

        {/* Editorial Subheadline */}
        <p
          style={{
            fontSize: "clamp(15px, 1.8vw, 18px)",
            lineHeight: 1.65,
            color: "var(--text-muted)",
            maxWidth: "720px",
            margin: "0 auto 36px",
            fontWeight: 400,
          }}
        >
          Deterministic retrieval at enterprise scale. From raw document ingestion and semantic chunking to BYOK
          embedding vaults, MongoDB Atlas Vector Search, and Reciprocal Rank Fusion.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "36px",
          }}
        >
          <Link href="/dashboard" className="btn-editorial-red">
            LAUNCH CONSOLE FREE →
          </Link>

          <a href="#architecture" className="btn-editorial-outline">
            READ ARCHITECTURE SPEC
          </a>
        </div>

        {/* cURL Pill */}
        <div onClick={handleCopy} className="editorial-curl-pill">
          <span style={{ color: "var(--primary-red)", fontWeight: 700 }}>$</span>
          <span>curl -X POST https://api.nullback.dev/api/v1/retrieve ...</span>
          <span
            style={{
              marginLeft: "10px",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.08em",
              padding: "2px 8px",
              borderRadius: "2px",
              backgroundColor: copied ? "rgba(22, 101, 52, 0.4)" : "rgba(255, 255, 255, 0.05)",
              color: copied ? "#86efac" : "var(--text-muted)",
              border: copied ? "1px solid #16a34a" : "1px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            {copied ? "COPIED" : "COPY"}
          </span>
        </div>
      </div>
    </section>
  );
}
