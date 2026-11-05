"use client";

import Link from "next/link";
import Logo from "../common/Logo";

export default function Navbar() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "rgba(6, 7, 10, 0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border-hairline)",
        width: "100%",
      }}
    >
      <div
        className="editorial-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Logo size={26} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-dim)",
              letterSpacing: "0.15em",
              borderLeft: "1px solid var(--border-hairline)",
              paddingLeft: "14px",
              display: "none",
            }}
            className="navbar-stamp"
          >
            SYS_REF // RAG.ATLAS.v1
          </span>
        </div>

        <nav>
          <ul
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              listStyle: "none",
            }}
            className="nav-links"
          >
            <li>
              <a href="#features" className="editorial-nav-link">
                01. FEATURES
              </a>
            </li>
            <li>
              <a href="#architecture" className="editorial-nav-link">
                02. ARCHITECTURE
              </a>
            </li>
            <li>
              <a href="#api-terminal" className="editorial-nav-link">
                03. API & SDK
              </a>
            </li>
            <li>
              <a href="/api/v1/health" target="_blank" className="editorial-nav-link">
                04. DIAGNOSTICS
              </a>
            </li>
          </ul>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/login"
            className="editorial-nav-link"
            style={{ padding: "7px 14px" }}
          >
            SIGN IN
          </Link>

          <Link
            href="/dashboard"
            className="btn-editorial-red"
            style={{ padding: "8px 16px", fontSize: "11px" }}
          >
            CONSOLE →
          </Link>
        </div>
      </div>
    </header>
  );
}
