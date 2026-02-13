"use client";
import { useEffect, useState } from "react";

export default function Messages() {
  const [toUsername, setTo] = useState("");
  const [body, setBody] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    const token = localStorage.getItem("token") || "";
    const res = await fetch("/api/dm/inbox", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) return setErr(data.error || "Failed");
    setMessages(data.messages);
  }

  async function send() {
    const token = localStorage.getItem("token") || "";
    const res = await fetch("/api/dm/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ toUsername, body }),
    });
    const data = await res.json();
    if (!res.ok) return setErr(data.error || "Failed");
    setTo(""); setBody("");
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 16, maxWidth: 820, margin: "0 auto" }}>
      <h1>Messages</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="To username" value={toUsername} onChange={(e) => setTo(e.target.value)} />
        <input placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} style={{ flex: 1, minWidth: 240 }} />
        <button onClick={send}>Send</button>
      </div>
      {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}
      <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, padding: 10 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ padding: "6px 0", borderBottom: "1px solid #eee" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{new Date(m.createdAt).toLocaleString()}</div>
            <div><b>{m.fromId}</b> → <b>{m.toId}</b>: {m.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
