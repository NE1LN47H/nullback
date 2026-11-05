import Logo from "../common/Logo";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#050608",
        borderTop: "1px solid var(--border-hairline)",
        padding: "60px 0 36px",
      }}
    >
      <div className="editorial-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "40px",
            marginBottom: "50px",
          }}
        >
          {/* Logo Column */}
          <div style={{ gridColumn: "span 2" }}>
            <div style={{ marginBottom: "16px" }}>
              <Logo size={24} />
            </div>
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.6,
                color: "var(--text-muted)",
                maxWidth: "320px",
              }}
            >
              Progressive managed RAG infrastructure platform for modern AI systems. Built with architectural purity,
              deterministic hybrid search, and hardware-grade BYOK security.
            </p>
          </div>

          {/* Column 1 */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.1em",
                marginBottom: "16px",
              }}
            >
              PLATFORM
            </div>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              <li><a href="#features" style={{ color: "inherit" }}>Semantic Chunker</a></li>
              <li><a href="#features" style={{ color: "inherit" }}>Hybrid Search RRF</a></li>
              <li><a href="#features" style={{ color: "inherit" }}>BYOK Key Vault</a></li>
              <li><a href="#architecture" style={{ color: "inherit" }}>Atlas Vector Storage</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.1em",
                marginBottom: "16px",
              }}
            >
              SPECIFICATIONS
            </div>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              <li><a href="#api-terminal" style={{ color: "inherit" }}>cURL / REST API</a></li>
              <li><a href="#api-terminal" style={{ color: "inherit" }}>JavaScript SDK</a></li>
              <li><a href="/api/v1/health" target="_blank" style={{ color: "inherit" }}>System Health Probe</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: "inherit" }}>GitHub Source</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.1em",
                marginBottom: "16px",
              }}
            >
              SECURITY
            </div>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              <li>AES-256-GCM Envelope</li>
              <li>SSRF Protection Subnets</li>
              <li>Magic-Byte Inspection</li>
              <li>Rate Limit In-Memory Shield</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--border-hairline)",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-dim)",
          }}
        >
          <div>
            © 2026 NULLBACK INFRASTRUCTURE INC. RELEASED UNDER THE MIT LICENSE.
          </div>
          <div>
            DESIGN SYSTEM // TECH EDITORIAL • SYNE & JETBRAINS MONO
          </div>
        </div>
      </div>
    </footer>
  );
}

