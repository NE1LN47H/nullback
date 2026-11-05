"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-client";

export default function ApiKeysView({ apiKeys, refreshApiKeys }) {
  const [keyName, setKeyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreateKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNewlyCreatedKey(null);

    try {
      const res = await authFetch("/api/v1/api-keys", {
        method: "POST",
        body: JSON.stringify({ name: keyName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create API key");
      }

      setNewlyCreatedKey(data.data?.apiKey || data.data?.key || "nb_live_" + Math.random().toString(36).substring(2));
      setKeyName("");
      refreshApiKeys();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (keyText) => {
    navigator.clipboard.writeText(keyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <span className="editorial-badge" style={{ marginBottom: "12px" }}>
          ACCESS // LIVE API CREDENTIALS
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
          API Access Keys
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Provision `nb_live_...` credentials to authenticate requests from your backend microservices.
        </p>
      </div>

      {/* Generator Form */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          padding: "24px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: "16px",
          }}
        >
          GENERATE NEW API SECRET
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

        <form onSubmit={handleCreateKey} style={{ display: "flex", gap: "12px", maxWidth: "600px" }}>
          <input
            type="text"
            required
            placeholder="Key name (e.g. production-backend-rag)"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            style={{
              flex: 1,
              padding: "9px 12px",
              backgroundColor: "#07080d",
              border: "1px solid var(--border-hairline)",
              color: "#ffffff",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-editorial-red"
            style={{ padding: "9px 18px", fontSize: "11px", flexShrink: 0 }}
          >
            {loading ? "PROVISIONING..." : "+ CREATE KEY"}
          </button>
        </form>

        {/* Newly Created Key Display */}
        {newlyCreatedKey && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              backgroundColor: "rgba(22, 101, 52, 0.15)",
              border: "1px solid #22c55e",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "#86efac",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              SECRET CREATED (COPY NOW - WILL NOT BE SHOWN AGAIN):
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "#ffffff",
              }}
            >
              <code style={{ flex: 1, wordBreak: "break-all" }}>{newlyCreatedKey}</code>
              <button
                type="button"
                onClick={() => handleCopy(newlyCreatedKey)}
                style={{
                  background: "#166534",
                  border: "none",
                  color: "#ffffff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  padding: "5px 12px",
                  cursor: "pointer",
                }}
              >
                {copied ? "COPIED!" : "COPY"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keys Table */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-hairline)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 2fr 1fr",
            padding: "14px 20px",
            borderBottom: "1px solid var(--border-hairline)",
            backgroundColor: "#07080d",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: "var(--text-dim)",
          }}
        >
          <div>KEY IDENTIFIER</div>
          <div>PREFIX / MASK</div>
          <div>STATUS</div>
        </div>

        {apiKeys.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}
          >
            NO ACTIVE API KEYS. GENERATE ONE ABOVE FOR REST & SDK ACCESS.
          </div>
        ) : (
          apiKeys.map((k) => (
            <div
              key={k._id || k.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 2fr 1fr",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-hairline)",
                alignItems: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
              }}
            >
              <div style={{ color: "#ffffff", fontWeight: 700 }}>
                {k.name || "Default Key"}
              </div>

              <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                {k.maskedKey || "nb_live_••••••••••••••••"}
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
                  ACTIVE
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

