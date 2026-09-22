"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", color: "#f87171" }}>
          Error
        </p>
        <h1 style={{ marginTop: "0.75rem", fontSize: "1.75rem", fontWeight: 800, textTransform: "uppercase" }}>
          Something Went Wrong
        </h1>
        <p style={{ marginTop: "0.75rem", maxWidth: "24rem", fontSize: "0.875rem", color: "#8a8a8a" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "2rem",
            borderRadius: "9999px",
            background: "#00ff66",
            color: "#000",
            padding: "0.75rem 1.75rem",
            fontSize: "0.875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
