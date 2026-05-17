"use client";

import { useEffect, useState } from "react";
import type { MediaTrack } from "@/types/RoomMusic";

interface Props {
  track: MediaTrack | null | undefined;
}

export function ProviderDebugOverlay({ track }: Props) {
  if (process.env.NODE_ENV !== "development") return null;
  return <DebugOverlayInner track={track} />;
}

function DebugOverlayInner({ track }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!visible || !track) return null;

  const providers = Object.keys(track.providers ?? {});
  const active = track.active_provider ?? "—";
  const canonical = track.canonical_track_id ?? "—";
  const ytEmbeddable = track.providers?.youtube?.embeddable;

  return (
    <div
      style={{
        position: "absolute",
        top: 4,
        left: 4,
        zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 11,
        padding: "4px 8px",
        borderRadius: 4,
        pointerEvents: "none",
        lineHeight: 1.6,
      }}
    >
      <div>
        <span style={{ color: "#aaa" }}>active: </span>
        <span style={{ color: active === "youtube" ? "#f00" : active === "spotify" ? "#1db954" : "#a238ff" }}>
          {active}
        </span>
      </div>
      <div>
        <span style={{ color: "#aaa" }}>providers: </span>
        {providers.join(", ") || "none"}
      </div>
      {ytEmbeddable !== undefined && (
        <div>
          <span style={{ color: "#aaa" }}>yt-embed: </span>
          <span style={{ color: ytEmbeddable ? "#0f0" : "#f55" }}>
            {ytEmbeddable ? "ok" : "blocked"}
          </span>
        </div>
      )}
      <div style={{ color: "#888", fontSize: 10 }}>{canonical}</div>
    </div>
  );
}
