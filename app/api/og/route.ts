import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a2332",
          color: "#ffffff",
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: "0.2em"
        }}
      >
        🟠 BTC THERMOMETER
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
