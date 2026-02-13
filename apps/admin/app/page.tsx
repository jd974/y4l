"use client";
import { useEffect, useState } from "react";

export default function AdminHome() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [token, setToken] = useState("");

  async function load() {
    const t = token || localStorage.getItem("admin_token") || "";
    if (!t) return;
    const s = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${t}` } });
    const sd = await s.json();
    if (s.ok) setStats(sd);

    const u = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${t}` } });
    const ud = await u.json();
    if (u.ok) setUsers(ud.users);
  }

  async function loginAsAdmin() {
    const emailOrUsername = prompt("Admin email or username", "admin") || "";
    const password = prompt("Admin password", "Admin123!") || "";
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername, password }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Login failed");
    localStorage.setItem("admin_token", data.token);
    setToken(data.token);
  }

  useEffect(() => { load(); }, [token]);

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Admin Panel</h1>
      <button onClick={loginAsAdmin}>Login as admin</button>
      <button onClick={load} style={{ marginLeft: 8 }}>Refresh</button>

      {stats && (
        <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}><b>Users:</b> {stats.users}</div>
          <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}><b>Live now:</b> {stats.live}</div>
        </div>
      )}

      <h2 style={{ marginTop: 18 }}>Users</h2>
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 10, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>Username</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>Email</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>Role</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>Stream Key</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ borderBottom: "1px solid #f2f2f2", padding: 8 }}>{u.username}</td>
                <td style={{ borderBottom: "1px solid #f2f2f2", padding: 8 }}>{u.email}</td>
                <td style={{ borderBottom: "1px solid #f2f2f2", padding: 8 }}>{u.role}</td>
                <td style={{ borderBottom: "1px solid #f2f2f2", padding: 8 }}><code>{u.streamKey}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
