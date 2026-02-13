import Link from "next/link";

async function getLive() {
  const base =
    typeof window === "undefined"
      ? "http://api:4000"
      : "";

  const r = await fetch(base + "/api/live/streams", {
    cache: "no-store",
  });

  if (!r.ok) return { streams: [] as any[] };
  return r.json();
}

export default async function Home() {
  const data = await getLive();
  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ margin: "8px 0" }}>Yours4Live</h1>
      <p style={{ marginTop: 0 }}>Public live directory</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign up</Link>
        <Link href="/profile">Profile</Link>
        <Link href="/battles">PK Battles</Link>
        <Link href="/messages">Messages</Link>
      </div>

      <h2>Live now</h2>
      {data.streams?.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
          {data.streams.map((s: any) => (
            <div key={s.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
              <div style={{ fontWeight: 700 }}>{s.user.username}</div>
              <div style={{ opacity: 0.8 }}>{s.title}</div>
              <div style={{ marginTop: 8 }}>
                <Link href={`/live/${s.user.streamKey}`}>Watch</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No one is live yet.</p>
      )}
    </div>
  );
}
