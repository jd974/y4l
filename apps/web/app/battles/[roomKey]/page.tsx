"use client";
import Hls from "hls.js";
import { io } from "socket.io-client";
import { useEffect, useMemo, useRef, useState } from "react";

export default function BattleRoom({ params }: { params: { roomKey: string } }) {
  const roomKey = params.roomKey;
  const [battle, setBattle] = useState<any>(null);
  const [err, setErr] = useState("");
  const [scores, setScores] = useState<{aScore:number;bScore:number}>({aScore:0,bScore:0});
  const aVid = useRef<HTMLVideoElement|null>(null);
  const bVid = useRef<HTMLVideoElement|null>(null);

  const room = useMemo(() => `battle:${roomKey}`, [roomKey]);

  async function load() {
    const res = await fetch(`/api/battles/${roomKey}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) return setErr(data.error || "Failed");
    setBattle(data.battle);
    setScores({ aScore: data.battle.aScore, bScore: data.battle.bScore });
  }

  useEffect(() => { load(); }, [roomKey]);

  useEffect(() => {
    if (!battle) return;
    const aSrc = `/hls/${battle.aUser.streamKey}.m3u8`;
    const bSrc = `/hls/${battle.bUser.streamKey}.m3u8`;

    function attach(video: HTMLVideoElement, src: string) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        return () => hls.destroy();
      } else {
        video.src = src;
        return () => {};
      }
    }

    const da = attach(aVid.current!, aSrc);
    const db = attach(bVid.current!, bSrc);
    return () => { da(); db(); };
  }, [battle]);

  useEffect(() => {
    const s = io({ path: "/socket.io" });
    s.emit("join", { room });
    s.on("battle:update", (u: any) => setScores({ aScore: u.aScore, bScore: u.bScore }));
    return () => s.disconnect();
  }, [room]);

  async function add(side: "A"|"B") {
    const s = io({ path: "/socket.io" });
    s.emit("battle:add", { roomKey, side, amount: 1 });
    s.disconnect();
  }

  if (err) return <div style={{ padding: 16, color: "crimson" }}>{err}</div>;
  if (!battle) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ padding: 12, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Battle: {roomKey}</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <b>{battle.aUser.username}</b>
            <b>{scores.aScore}</b>
          </div>
          <video ref={aVid} controls autoPlay playsInline style={{ width: "100%", background: "#000", borderRadius: 12, marginTop: 8 }} />
          <button onClick={() => add("A")} style={{ marginTop: 10 }}>+1 A</button>
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <b>{battle.bUser.username}</b>
            <b>{scores.bScore}</b>
          </div>
          <video ref={bVid} controls autoPlay playsInline style={{ width: "100%", background: "#000", borderRadius: 12, marginTop: 8 }} />
          <button onClick={() => add("B")} style={{ marginTop: 10 }}>+1 B</button>
        </div>
      </div>
    </div>
  );
}
