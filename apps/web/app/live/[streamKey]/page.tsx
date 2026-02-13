"use client";
import Hls from "hls.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function LiveWatch({ params }: { params: { streamKey: string } }) {
  const streamKey = params.streamKey;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [chat, setChat] = useState<{username:string;message:string;ts:number}[]>([]);
  const [msg, setMsg] = useState("");
  const [name, setName] = useState("viewer");

  const room = useMemo(() => `live:${streamKey}`, [streamKey]);

  useEffect(() => {
    const src = `/hls/${streamKey}.m3u8`;
    const video = videoRef.current!;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else {
      // Safari
      video.src = src;
    }
  }, [streamKey]);

  useEffect(() => {
    const s = io({ path: "/socket.io" });
    s.emit("join", { room });
    s.on("chat", (m: any) => setChat((c) => [...c.slice(-200), m]));
    return () => { s.disconnect(); };
  }, [room]);

  function send() {
    const s = io({ path: "/socket.io" });
    s.emit("chat", { room, username: name, message: msg });
    setMsg("");
    s.disconnect();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, padding: 12, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Live: {streamKey}</h1>
      <video ref={videoRef} controls autoPlay playsInline style={{ width: "100%", maxHeight: 520, background: "#000", borderRadius: 12 }} />
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Say something…" style={{ flex: 1, minWidth: 220 }} />
          <button onClick={send}>Send</button>
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 10, height: 240, overflow: "auto" }}>
          {chat.map((c, i) => (
            <div key={i}><b>{c.username}:</b> {c.message}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
