/*
 * Copyright (c) 2025 Pooya Moradi M. poamrd@gmail.com https://github.com/PooyaDeperson
 * Licensed under the MIT License with Attribution.
 *
 * Permission is hereby granted, free of charge, to use, copy, modify, merge,
 * publish, and distribute this software, provided that the following credit
 * is included in any derivative or distributed version:
 * "Created by Pooya Moradi M. poamrd@gmail.com https://github.com/PooyaDeperson"
 */

// TrackingLoader.tsx
// Full overlay shown while MediaPipe initialises.
// Shows a progress bar, stage label, and animated percentage counter.

import React, { useEffect, useRef, useState } from "react";
import type { InitProgress } from "../FaceTracking";

interface TrackingLoaderProps {
  visible: boolean;
  progress?: InitProgress | null;
  error?: string | null;
}

// ─── Slow tick-based fake progress ────────────────────────────────────────────
// Crawls toward `target` 1–3% per tick so the bar always moves,
// even when no INIT_PROGRESS messages arrive. Snaps forward immediately
// if the real target jumps ahead.

const TICK_MS = 3000;

function useSlowProgress(target: number, visible: boolean): number {
  const [crawl, setCrawl] = useState(0);
  const justReset = useRef(false);

  useEffect(() => {
    if (visible) {
      justReset.current = true;
      setCrawl(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    if (crawl >= target) return;

    const id = setTimeout(() => {
      const step = Math.floor(Math.random() * 3) + 1;
      setCrawl((prev) => Math.min(prev + step, target));
    }, TICK_MS);

    return () => clearTimeout(id);
  }, [crawl, target, visible]);

  useEffect(() => {
    if (!visible) return;
    if (justReset.current) {
      justReset.current = false;
      return;
    }
    setCrawl((prev) => (target > prev ? target : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return crawl;
}

// ─── Animated percentage counter ──────────────────────────────────────────────
// Ticks up toward `target` by 1 every ~30ms for a smooth count-up effect.

function useAnimatedPercentage(target: number, visible: boolean): number {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const currentRef = useRef(0);

  useEffect(() => {
    if (visible) {
      currentRef.current = 0;
      setDisplay(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const tick = () => {
      if (currentRef.current < target) {
        currentRef.current = Math.min(currentRef.current + 1, target);
        setDisplay(currentRef.current);
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, visible]);

  return display;
}

// ─── Stage label map ──────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  wasm: "Getting things ready\u2026",
  face: "Show your face fully in the frame\u2026",
  hand: "You can use your fingers to animate too\u2026",
  pose: "Adding the final tracking assets\u2026",
  done: "All set!",
};

// ─── Component ────────────────────────────────────────────────────────────────

const TrackingLoader: React.FC<TrackingLoaderProps> = ({ visible, progress, error }) => {
  const targetPercentage = error ? 0 : (progress?.percentage ?? 30);

  const stageLabel = progress?.stage
    ? (STAGE_LABELS[progress.stage] ?? "Getting things ready\u2026")
    : "Getting things ready\u2026";

  const label = error ? "Something went wrong loading the tracker." : stageLabel;

  const slowPct = useSlowProgress(targetPercentage, visible);
  const displayPct = useAnimatedPercentage(slowPct, visible);
  const isDone = !error && progress?.stage === "done";

  if (!visible) return null;

  return (
    <div className="reveal fade mediapipe-loader pos-fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-999">
      <div className="flex flex-col items-center gap-2" style={{ width: 220 }}>

        {/* Progress bar track */}
        <div
          style={{
            width: "100%",
            height: 4,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.15)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 9999,
              width: `${slowPct}%`,
              background: error ? "#ef4444" : "#60a5fa",
              transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
              animation: !isDone && !error ? "pulse 1.5s ease-in-out infinite" : undefined,
            }}
          />
        </div>

        {/* Stage label */}
        <p
          className="text-white text-2xl"
          style={{
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
            color: error ? "#fca5a5" : "rgba(255,255,255,0.88)",
            margin: 0,
          }}
        >
          {label}
        </p>

        {/* Percentage */}
        {!error && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {displayPct}%
          </span>
        )}

      </div>
    </div>
  );
};

export default TrackingLoader;
