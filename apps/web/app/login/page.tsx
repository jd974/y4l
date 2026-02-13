"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [emailOrUsername, setE] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const r = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername, password }),
    });
    const data = await res.json();
    if (!res.ok) return setErr(data.error || "Login failed");
    localStorage.setItem("token", data.token);
    r.push("/profile");
  }

  return (
    <div style={{ padding: 16, maxWidth: 420, margin: "0 auto" }}>
      <h1>Login</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input placeholder="Email or username" value={emailOrUsername} onChange={(e) => setE(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setP(e.target.value)} />
        <button>Login</button>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
    </div>
  );
}
