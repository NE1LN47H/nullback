import Link from "next/link";

export default function Logo({ size = 28 }) {
  return (
    <Link
      href="/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        textDecoration: "none",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 0 10px rgba(224, 35, 78, 0.6))",
          flexShrink: 0,
        }}
      >
        {/* Outer technical hexagon */}
        <polygon
          points="20,2 38,12 38,28 20,38 2,28 2,12"
          fill="#06070a"
          stroke="#e0234e"
          strokeWidth="2.2"
        />
        {/* Inner geometric facets */}
        <polygon
          points="20,8 32,15 32,25 20,32 8,25 8,15"
          fill="#e0234e"
          fillOpacity="0.18"
          stroke="#e0234e"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        {/* Center radiant node */}
        <polygon points="20,13 27,17 27,23 20,27 13,23 13,17" fill="#ff3366" />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "17px",
          letterSpacing: "0.08em",
          color: "#ffffff",
          textTransform: "uppercase",
        }}
      >
        NULL<span style={{ color: "var(--primary-red)" }}>BACK</span>
      </span>
    </Link>
  );
}

