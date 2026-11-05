"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-client";

export default function ByokVaultView({ configs, refreshConfigs }) {
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await authFetch("/api/v1/embedding-configs", {
        method: "POST",
        body: JSON.stringify({
          provider,
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to store encryption credential");
      }

      setSuccess(`Stored encrypted ${provider.toUpperCase()} credential in AES-256-GCM vault.`);
      setApiKey("");
      refreshConfigs();
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
          SECURITY // AES-256-GCM ENVELOPE
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
          BYOK Credential Vault
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Bring your own keys for OpenAI, Voyage AI, or Cohere. Stored with authenticated symmetric encryption.
        </p>
      </div>

      {/* Security Architecture Notice */}
      <div
        style={{
          backgroundColor: "rgba(224, 35, 78, 0.06)",
          border: "1px solid rgba(224, 35, 78, 0.3)",
          padding: "18px 20px",
          marginBottom: "32px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          lineHeight: 1.6,
          color: "#e2e8f0",
        }}
      >
        <span style={{ color: "var(--primary-red)", fontWeight: 700 }}>
          [VAULT PROTOCOL SPECIFICATION]
        </span>{" "}
        API keys are protected via AES-256-GCM authenticated cipher with dynamic 16-byte initialization vectors and
        authentication tags. Keys are decrypted in-memory only when calculating vector embeddings during ingestion and
        are strictly redacted from request logs and database projections.
      </div>

      {/* Form */}
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
          ENCRYPT & STORE EMBEDDING CREDENTIAL
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

        {success && (
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "rgba(22, 101, 52, 0.2)",
              border: "1px solid #22c55e",
              color: "#86efac",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              marginBottom: "16px",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
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
                PROVIDER
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
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
                <option value="openai">OpenAI (text-embedding-3)</option>
                <option value="voyage">Voyage AI (voyage-3)</option>
                <option value="cohere">Cohere (embed-v3)</option>
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
                API SECRET KEY
              </label>
              <input
                type="password"
                required
                placeholder="sk-proj-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="btn-editorial-red"
            style={{ padding: "10px 20px", fontSize: "11px" }}
          >
            {loading ? "ENCRYPTING & STORING..." : "COMMIT TO AES-256 VAULT →"}
          </button>
        </form>
      </div>

      {/* Active Vault Keys */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-hairline)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 1fr 1fr",
            padding: "14px 20px",
            borderBottom: "1px solid var(--border-hairline)",
            backgroundColor: "#07080d",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: "var(--text-dim)",
          }}
        >
          <div>PROVIDER</div>
          <div>MASKED CIPHER DISPLAY</div>
          <div>CIPHER METHOD</div>
          <div>STATUS</div>
        </div>

        {configs.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}
          >
            NO ENCRYPTION KEYS STORED IN VAULT. CONFIGURE A PROVIDER KEY ABOVE.
          </div>
        ) : (
          configs.map((c) => (
            <div
              key={c._id || c.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr 1fr 1fr",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-hairline)",
                alignItems: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
              }}
            >
              <div style={{ color: "#ffffff", fontWeight: 700, textTransform: "uppercase" }}>
                {c.provider}
              </div>

              <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                {c.maskedApiKey || "sk-••••••••••••••••"}
              </div>

              <div style={{ color: "var(--primary-red)", fontSize: "11px" }}>
                AES-256-GCM
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
                  ENCRYPTED
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

