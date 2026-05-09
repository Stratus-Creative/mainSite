"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  /** ISO timestamp of the most recent submission known at server-render time. */
  since: string;
};

const SOUND_KEY = "stratus-admin-newsub-sound";

export function NewSubmissionWatcher({ since }: Props) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const sinceRef = useRef(since);
  const lastBeepCountRef = useRef(0);

  // Hydrate sound preference
  useEffect(() => {
    try {
      const v = localStorage.getItem(SOUND_KEY);
      setSoundOn(v === "1");
    } catch {
      // no-op
    }
  }, []);

  // Persist sound preference
  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
    } catch {
      // no-op
    }
  }, [soundOn]);

  // Polling
  useEffect(() => {
    let active = true;

    async function tick() {
      try {
        const url = `/api/admin/new-since?since=${encodeURIComponent(sinceRef.current)}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const data: { count: number; latestId?: string } = await res.json();
        if (!active) return;

        if (typeof data.count === "number" && data.count > 0) {
          setCount(data.count);
          if (soundOn && data.count > lastBeepCountRef.current) {
            beep();
          }
          lastBeepCountRef.current = data.count;
        }
      } catch {
        // swallow
      }
    }

    const id = window.setInterval(tick, 30_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [soundOn]);

  function beep() {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      window.setTimeout(() => {
        osc.stop();
        ctx.close().catch(() => {});
      }, 100);
    } catch {
      // ignore
    }
  }

  function handleRefresh() {
    setCount(0);
    lastBeepCountRef.current = 0;
    router.refresh();
  }

  return (
    <>
      {/* Sound toggle (always visible, very subtle) */}
      <button
        type="button"
        onClick={() => setSoundOn((s) => !s)}
        className="fixed bottom-4 right-4 z-40 rounded-full border border-border/60 bg-card/80 px-3 py-2 text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        title={soundOn ? "Sound on — click to mute" : "Sound off — click to enable"}
        aria-label={soundOn ? "Mute new-submission sound" : "Enable new-submission sound"}
      >
        {soundOn ? "🔔" : "🔕"}
      </button>

      {count > 0 && (
        <div
          role="status"
          className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-accent/40 bg-card/95 px-4 py-2 text-sm shadow-lg backdrop-blur"
        >
          <span className="text-foreground">
            {count} new submission{count === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent transition-colors hover:bg-accent/20"
          >
            Refresh
          </button>
        </div>
      )}
    </>
  );
}
