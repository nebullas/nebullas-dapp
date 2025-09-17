import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px", textAlign: "center" }}>
      <h1>Nebullas ICO</h1>
      <p>Welcome. Use the links below.</p>

      {/* Links list */}
      <ul style={{ display: "flex", justifyContent: "center", gap: 16, listStyle: "none", paddingLeft: 0 }}>
        <li><Link href="/buy">Buy NBL</Link></li>
        <li><Link href="/partner">Partner Dashboard</Link></li>
        <li><Link href="/admin">Admin Panel</Link></li>
      </ul>

      {/* Old CTA button */}
      <div style={{ marginTop: 24 }}>
        <a
          href="/buy"
          style={{
            display: "inline-block",
            marginTop: 16,
            padding: "10px 16px",
            border: "1px solid #111",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Go to Buy NBL
        </a>
      </div>
    </main>
  );
}
