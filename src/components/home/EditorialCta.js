import Link from "next/link";

export default function EditorialCta() {
  return (
    <section style={{ padding: "100px 0" }}>
      <div className="editorial-container" style={{ maxWidth: "960px" }}>
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            padding: "64px 36px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 50px -15px rgba(224, 35, 78, 0.2)",
          }}
        >
          {/* Top red accent line */}
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

          <span className="editorial-badge" style={{ marginBottom: "20px" }}>
            GETTING STARTED // DEVELOPER ONBOARDING
          </span>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(26px, 4.5vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Deploy Enterprise RAG <br />
            <span style={{ color: "var(--primary-red)" }}>Without The Infrastructure Tax.</span>
          </h2>

          <p
            style={{
              fontSize: "15px",
              color: "var(--text-muted)",
              maxWidth: "580px",
              margin: "0 auto 36px",
              lineHeight: 1.6,
            }}
          >
            Eliminate fragile custom vector orchestrations. Ingest documents, encrypt your embedding keys, and retrieve
            high-recall context over a single unified API.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <Link href="/dashboard" className="btn-editorial-red">
              CREATE FREE ACCOUNT →
            </Link>
            <Link href="/login" className="btn-editorial-outline">
              SIGN IN TO CONSOLE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

