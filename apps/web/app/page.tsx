"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // IMPORTANT: use same-origin path (no IP, no port 8080)
    const streamUrl = "/live/manualtest.m3u8";

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 3,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (event, data) {
        console.error("HLS error:", data);
      });

    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    }
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Live Stream</h1>
      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        playsInline
        width="800"
        style={{ background: "black" }}
      />
    </div>
  );
}

