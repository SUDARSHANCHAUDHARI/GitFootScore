"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("[gitfootscore] global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          background: "#080b16",
          color: "#eef2ff",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.3em", color: "#29e5a8" }}>
          GITFOOTSCORE
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Something broke</h1>
        <button
          onClick={reset}
          style={{
            borderRadius: 12,
            background: "#29e5a8",
            color: "#04160e",
            fontWeight: 700,
            padding: "10px 20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
