"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  /** ms */
  duration?: number;
  prefix?: string;
  suffix?: string;
  /** Renders this string instead of formatted number when reduced-motion is on (or until reveal) */
  fallback?: string;
}

export function CountUp({ value, duration = 800, prefix = "", suffix = "", fallback }: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const start = performance.now();
            let frame: number;
            const step = (now: number) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // ease-out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              setDisplay(Math.round(value * eased));
              if (progress < 1) frame = requestAnimationFrame(step);
            };
            frame = requestAnimationFrame(step);
            observer.disconnect();
            return () => cancelAnimationFrame(frame);
          }
        }
      },
      { rootMargin: "0px 0px -20% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  const formatted =
    display === null
      ? fallback ?? ""
      : `${prefix}${display.toLocaleString()}${suffix}`;
  return <span ref={ref}>{formatted}</span>;
}
