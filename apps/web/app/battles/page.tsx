"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Battles() {
  const [opponentUsername, setOpp] = useState("");
  const [err, setErr] = useState("");
  const r = useRouter();

  async function create() {
    setErr("");
    const token = localStorage.getItem("token") || "";
    const res = await fetch("/api/battles/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ opponentUsername }),
    });
    const data = await res.json();
    if (!res.ok) return setErr(data.error || "Failed");
    r.push(`/battles/${data.battle.roomKey}`);
  }

  return (
    <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
      <h1>PK Battles</h1>
      <p>Create a battle room vs another user.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={opponentUsername} onChange={(e) => setOpp(e.target.value)} placeholder="Opponent username" />
        <button onClick={create}>Create</button>
      </div>
      {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}
    </div>
  );
}
