"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const r = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (!res.ok) return setErr(data.error?.formErrors?.join(", ") || data.error || "Signup failed");
    localStorage.setItem("token", data.token);
    r.push("/profile");
  }

  return (
    <div style={{ padding: 16, maxWidth: 420, margin: "0 auto" }}>
      <h1>Sign up</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Username" value={username} onChange={(e) => setU(e.target.value)} />
        <input placeholder="Password (min 8 chars)" type="password" value={password} onChange={(e) => setP(e.target.value)} />
        <button>Create account</button>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
    </div>
  );
}
