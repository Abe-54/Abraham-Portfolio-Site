import { ImageResponse } from "next/og";

export const alt = "Abraham Rubio, Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #081d27 0%, #17303b 60%, #45406e 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
            <div
              key={color}
              style={{ width: 22, height: 22, borderRadius: 11, background: color }}
            />
          ))}
        </div>
        <div style={{ fontSize: 88, fontWeight: 700 }}>Abraham Rubio</div>
        <div style={{ fontSize: 40, color: "#599fc0", marginTop: 12 }}>
          Software Engineer · Frontend &amp; interactive UI
        </div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.6)", marginTop: 32 }}>
          Ex-NASA climate game intern · Game developer · Newark, NJ
        </div>
      </div>
    ),
    size
  );
}
