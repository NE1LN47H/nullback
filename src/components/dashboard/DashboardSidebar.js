"use client";

export default function DashboardSidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "overview", label: "OVERVIEW", num: "01" },
    { id: "knowledge-bases", label: "KNOWLEDGE BASES", num: "02" },
    { id: "documents", label: "DOCUMENT INGESTION", num: "03" },
    { id: "byok", label: "BYOK CREDENTIAL VAULT", num: "04" },
    { id: "playground", label: "RETRIEVAL PLAYGROUND", num: "05" },
    { id: "apikeys", label: "API ACCESS KEYS", num: "06" },
  ];

  return (
    <aside
      style={{
        width: "250px",
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-hairline)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        padding: "24px 0",
      }}
    >
      <div
        style={{
          padding: "0 20px 16px",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.12em",
          color: "var(--text-dim)",
          textTransform: "uppercase",
          borderBottom: "1px solid var(--border-hairline)",
          marginBottom: "16px",
        }}
      >
        NAVIGATION // WORKSPACE
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 20px",
                width: "100%",
                background: isActive ? "rgba(224, 35, 78, 0.08)" : "transparent",
                border: "none",
                borderLeft: isActive
                  ? "2px solid var(--primary-red)"
                  : "2px solid transparent",
                color: isActive ? "#ffffff" : "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.05em",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span
                style={{
                  color: isActive ? "var(--primary-red)" : "var(--text-dim)",
                  fontWeight: 700,
                  fontSize: "10px",
                }}
              >
                [{tab.num}]
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Architectural Info */}
      <div
        style={{
          marginTop: "auto",
          padding: "20px",
          borderTop: "1px solid var(--border-hairline)",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--text-dim)",
          lineHeight: 1.6,
        }}
      >
        <div>ENGINE: HYBRID_RRF_v1</div>
        <div>VAULT: AES_256_GCM</div>
        <div>INDEX: ATLAS_HNSW</div>
      </div>
    </aside>
  );
}

