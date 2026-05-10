"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function RevealMask({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const cls = ["motion-reveal-mask", revealed ? "is-in-view" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div ref={ref} className={cls}>
      {children}
    </div>
  );
}
