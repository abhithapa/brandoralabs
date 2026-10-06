import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Provisional social image using the temporary palette. Replace with brand artwork when supplied. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#17212b", color: "#f3f6f8", padding: 80 }}>
        <div style={{ fontSize: 40, fontWeight: 700 }}>{siteConfig.name}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{siteConfig.tagline}</div>
          <div style={{ fontSize: 30, marginTop: 24, color: "#b7c3cd" }}>{siteConfig.positioning}</div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 26, color: "#b7c3cd" }}>
          {["Understand", "Analyze", "Connect", "Deliver"].map((step) => (
            <span key={step}>{step} ·</span>
          ))}
          <span style={{ color: "#7fd1a8" }}>Grow</span>
        </div>
      </div>
    ),
    size,
  );
}
