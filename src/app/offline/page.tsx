import type { CSSProperties } from "react";
import Link from "next/link";
import fa from "../../../messages/fa.json";
import en from "../../../messages/en.json";

export const dynamic = "force-static";

const faCopy = fa.pwa.offline;
const enCopy = en.pwa.offline;

const pageStyle: CSSProperties = {
  minHeight: "100dvh",
  display: "grid",
  placeItems: "center",
  padding:
    "calc(1.5rem + env(safe-area-inset-top)) 1.25rem calc(1.5rem + env(safe-area-inset-bottom))",
  boxSizing: "border-box",
  background:
    "radial-gradient(42rem 28rem at 50% -10%, rgba(244, 63, 94, 0.16), transparent 65%), #08080a",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "34rem",
  borderRadius: "1.5rem",
  border: "1px solid rgba(251, 113, 133, 0.24)",
  backgroundColor: "rgba(16, 16, 20, 0.9)",
  padding: "1.75rem",
  boxShadow: "0 28px 80px -40px rgba(225, 29, 72, 0.55)",
};

const markStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: "3.5rem",
  height: "3.5rem",
  borderRadius: "1rem",
  border: "1px solid rgba(251, 113, 133, 0.35)",
  backgroundColor: "rgba(251, 113, 133, 0.1)",
  color: "#fb7185",
  fontSize: "1.75rem",
  fontWeight: 700,
  lineHeight: 1,
};

const titleStyle: CSSProperties = {
  margin: "1.25rem 0 0",
  fontSize: "1.5rem",
  fontWeight: 700,
  letterSpacing: "-0.02em",
};

const descriptionStyle: CSSProperties = {
  margin: "0.5rem 0 0",
  color: "#9a9aa5",
  fontSize: "0.9rem",
  lineHeight: 1.9,
};

const linkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "1.25rem",
  borderRadius: "0.75rem",
  backgroundColor: "#e11d48",
  color: "#ffffff",
  padding: "0.65rem 1rem",
  fontSize: "0.85rem",
  fontWeight: 600,
  textDecoration: "none",
};

const dividerStyle: CSSProperties = {
  height: 1,
  margin: "1.5rem 0",
  backgroundColor: "rgba(39, 39, 47, 0.9)",
};

export default function OfflinePage() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle} aria-labelledby="offline-title-fa">
        <div style={markStyle} aria-hidden="true">
          آ
        </div>

        <div lang="fa" dir="rtl">
          <h1 id="offline-title-fa" style={titleStyle}>
            {faCopy.title}
          </h1>
          <p style={descriptionStyle}>{faCopy.description}</p>
          <Link href="/ledgers" prefetch={false} style={linkStyle}>
            {faCopy.back}
          </Link>
        </div>

        <div style={dividerStyle} />

        <div lang="en" dir="ltr">
          <h2 style={{ ...titleStyle, marginTop: 0, fontSize: "1.25rem" }}>
            {enCopy.title}
          </h2>
          <p style={descriptionStyle}>{enCopy.description}</p>
          <Link href="/ledgers" prefetch={false} style={linkStyle}>
            {enCopy.back}
          </Link>
        </div>
      </section>
    </main>
  );
}
