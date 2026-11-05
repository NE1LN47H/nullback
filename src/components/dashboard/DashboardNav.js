"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../common/Logo";
import { clearClientAuth } from "@/lib/auth-client";

export default function DashboardNav({ user, healthStatus }) {
  const router = useRouter();

  const handleLogout = () => {
    clearClientAuth();
    router.push("/login");
  };

  return (
    <header
      style={{
        height: "60px",
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-hairline)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Project Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Logo size={24} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
            borderLeft: "1px solid var(--border-hairline)",
            paddingLeft: "14px",
          }}
        >
          CONSOLE // RAG.ORCHESTRATOR
        </span>
      </div>

      {/* Status, User & Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        {/* Health Probe Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 10px",
            backgroundColor: "rgba(22, 101, 52, 0.2)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "2px",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "#86efac",
            letterSpacing: "0.06em",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: healthStatus ? "#22c55e" : "#eab308",
            }}
          />
          <span>{healthStatus ? "ATLAS CLUSTER ONLINE" : "CLUSTER CONNECTING"}</span>
        </div>

        {/* User Badge */}
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-editorial)",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "2px",
                backgroundColor: "var(--primary-red-muted)",
                border: "1px solid var(--primary-red)",
                color: "#ff476d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "11px",
              }}
            >
              {user.name ? user.name[0].toUpperCase() : "U"}
            </span>
            <span style={{ color: "var(--text-muted)" }}>{user.email}</span>
          </div>
        )}

        {/* Docs Link */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.06em",
            color: "var(--text-dim)",
            textDecoration: "none",
          }}
        >
          DOCS ↗
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "1px solid var(--border-hairline)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.06em",
            padding: "5px 12px",
            cursor: "pointer",
            borderRadius: "2px",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary-red)";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-hairline)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          DISCONNECT
        </button>
      </div>
    </header>
  );
}

