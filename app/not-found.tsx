import Link from "next/link";

export default function RootNotFound() {
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
        <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", color: "#00ff66" }}>
          404
        </p>
        <h1 style={{ marginTop: "0.75rem", fontSize: "1.75rem", fontWeight: 800, textTransform: "uppercase" }}>
          Page Not Found
        </h1>
        <p style={{ marginTop: "0.75rem", maxWidth: "24rem", fontSize: "0.875rem", color: "#8a8a8a" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          style={{
            marginTop: "2rem",
            borderRadius: "9999px",
            background: "#00ff66",
            color: "#000",
            padding: "0.75rem 1.75rem",
            fontSize: "0.875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Back to Home
        </Link>
      </body>
    </html>
  );
}
