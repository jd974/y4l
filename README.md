# Yours4Live Platform (Starter Monorepo) — RTMP/HLS + API + Web + Admin

This is a **working starter** for a public TikTok-Live-style platform:
- **NGINX-RTMP ingest** (RTMP) + **HLS playback**
- **API** (Node + TypeScript + Prisma + Postgres)
- **Realtime** via **Socket.IO** (chat, presence, rooms)
- **PK battles** (basic battle-room state + scoring)
- **Messaging** (basic DM threads + messages)
- **Web app** (Next.js, responsive for phone + desktop)
- **Admin panel** (Next.js) to manage users/streams/reports

> This is a foundation you can extend (gifts, coins/diamonds, moderation, multi-guest boxes, etc.).
> It’s designed to run on a VPS via Docker Compose.

---

## 0) Requirements
- Ubuntu VPS
- Docker + Docker Compose plugin installed
- A domain is recommended (optional)

Install Docker (Ubuntu):
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

---

## 1) Configure your domain / IP
This stack exposes:
- Web: **80**
- RTMP: **1935**
- API: internal (routed by web app)

If you use Cloudflare, **do not proxy RTMP (1935)**. HLS can be proxied.

---

## 2) First run
From the repo folder:
```bash
cp .env.example .env
docker compose up -d --build
```

Then initialize DB schema:
```bash
docker compose exec api npm run db:push
docker compose exec api npm run seed
```

Open:
- Web: `http://YOUR_SERVER_IP/`
- Admin: `http://YOUR_SERVER_IP/admin`
- HLS stream: `http://YOUR_SERVER_IP/hls/<streamKey>.m3u8`

---

## 3) How streaming works (PRISM/OBS)
In PRISM/OBS custom RTMP:
- Server: `rtmp://YOUR_SERVER_IP/live`
- Stream Key: from the Web app **Profile → Stream Key** (or use seed user key)

Playback:
- `http://YOUR_SERVER_IP/live/<streamKey>`
- Or direct playlist: `http://YOUR_SERVER_IP/hls/<streamKey>.m3u8`

---

## 4) Default accounts (seed)
- Admin: `admin@yours4live.local` / `Admin123!`
- Creator: `creator@yours4live.local` / `Creator123!`

Change these immediately after first login.

---

## 5) Next upgrades you’ll likely want
- Coins/diamonds + gifts ledger
- Multi-guest (WebRTC SFU like LiveKit/mediasoup) for “boxes”
- Moderation tools: bans, mutes, report queues, keyword filters
- Recording, VOD, clips
- Search + hashtags + recommendations feed

---

## Folder structure
- `services/api` API + Socket.IO + DB
- `services/media` NGINX + RTMP + HLS
- `apps/web` Viewer/Creator web app (responsive)
- `apps/admin` Admin panel (responsive)

---

## Notes
This starter focuses on: **public live directory + watch page + chat + PK battle rooms + DMs + admin control**.
It’s intentionally clean so you can evolve it into full Yours4Live.

