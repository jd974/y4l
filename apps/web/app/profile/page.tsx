"use client";
import { useEffect, useState } from "react";

export default function Profile() {
  const [me, setMe] = useState<any>(null);
  const [err, setErr] = useState("");

  async function load() {
    const token = localStorage.getItem("token") || "";
    const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) return setErr(data.error || "Failed");
    setMe(data.me);
  }

  async function rotate() {
    const token = localStorage.getItem("token") || "";
    const res = await fetch("/api/me/stream-key/rotate", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed");
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <h1>Profile</h1>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {me ? (
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <div><b>Username:</b> {me.username}</div>
          <div><b>Role:</b> {me.role}</div>
          <div style={{ marginTop: 10 }}>
            <div><b>Stream Server:</b> <code>rtmp://YOUR_SERVER_IP/live</code></div>
            <div><b>Stream Key:</b> <code>{me.streamKey}</code></div>
            <div style={{ marginTop: 8 }}>
              <a href={`/live/${me.streamKey}`}>Watch my stream page</a>
            </div>
            <button style={{ marginTop: 10 }} onClick={rotate}>Rotate Stream Key</button>
          </div>
        </div>
      ) : (
        <div>Loading…</div>
      )}
    </div>
  );
}
