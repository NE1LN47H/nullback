"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import { setClientAuth } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        // 1. Call Register
        const res = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || data.error || "Registration failed");
        }

        // 2. Automatically log in after registration
        const loginRes = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          throw new Error(loginData.message || "Auto-login failed. Please sign in.");
        }

        const token = loginData.data?.accessToken;
        const user = loginData.data?.user;
        setClientAuth(token, user);
        router.push("/dashboard");
      } else {
        // Sign In
        const res = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || data.error || "Invalid credentials");
        }

        const token = data.data?.accessToken;
        const user = data.data?.user;
        setClientAuth(token, user);
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "An unexpected authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor: "var(--bg-pitch)",
        position: "relative",
      }}
    >
      {/* Background radial crimson highlight */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          background: "radial-gradient(ellipse at center, rgba(224, 35, 78, 0.12), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Brand Link */}
      <div style={{ marginBottom: "32px", zIndex: 1 }}>
        <Logo size={32} />
      </div>

      {/* Auth Box */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          padding: "36px 32px",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 20px 50px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(224, 35, 78, 0.15)",
        }}
      >
        {/* Top Red Hairline */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent, var(--primary-red), transparent)",
          }}
        />

        {/* Tab Toggle: Sign In / Create Account */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px",
            backgroundColor: "#08090e",
            padding: "4px",
            border: "1px solid var(--border-hairline)",
            marginBottom: "28px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            style={{
              padding: "8px 12px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: !isRegister ? "#ffffff" : "var(--text-muted)",
              backgroundColor: !isRegister ? "var(--bg-card)" : "transparent",
              border: !isRegister ? "1px solid var(--border-card)" : "1px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            01. SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            style={{
              padding: "8px 12px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: isRegister ? "#ffffff" : "var(--text-muted)",
              backgroundColor: isRegister ? "var(--bg-card)" : "transparent",
              border: isRegister ? "1px solid var(--border-card)" : "1px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            02. REGISTER
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            {isRegister ? "CREATE DEVELOPER ACCOUNT" : "AUTHENTICATE CONSOLE"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
            {isRegister
              ? "Initialize managed RAG vector workspaces and BYOK credential vaults."
              : "Access your knowledge bases, vector search logs, and hybrid pipelines."}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(224, 35, 78, 0.12)",
              border: "1px solid var(--primary-red)",
              color: "#ff6b8b",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontWeight: 800 }}>!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "var(--text-white)",
                  marginBottom: "6px",
                }}
              >
                NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#07080d",
                  border: "1px solid var(--border-hairline)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary-red)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-hairline)")}
              />
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "var(--text-white)",
                marginBottom: "6px",
              }}
            >
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@nullback.dev"
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#07080d",
                border: "1px solid var(--border-hairline)",
                color: "#ffffff",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary-red)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-hairline)")}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "var(--text-white)",
                marginBottom: "6px",
              }}
            >
              PASSWORD (MIN 8 CHARACTERS)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#07080d",
                border: "1px solid var(--border-hairline)",
                color: "#ffffff",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary-red)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-hairline)")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-editorial-red"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "12px",
              letterSpacing: "0.08em",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading
              ? "AUTHENTICATING..."
              : isRegister
              ? "INITIALIZE ACCOUNT →"
              : "ENTER CONSOLE →"}
          </button>
        </form>

        {/* Back Link */}
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-dim)",
              letterSpacing: "0.05em",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.target.style.color = "var(--text-white)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--text-dim)")}
          >
            ← RETURN TO HOMEPAGE
          </Link>
        </div>
      </div>
    </div>
  );
}

