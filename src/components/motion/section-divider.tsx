"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

interface Props {
  className?: string;
  origin?: "left" | "right" | "center";
}

export function SectionDivider({ className, origin = "left" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
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

  const style: CSSProperties = {
    transformOrigin: origin === "center" ? "center" : origin,
  };
  const cls = ["motion-divider", revealed ? "is-in-view" : "", className]
    .filter(Boolean)
    .join(" ");
  return <div ref={ref} className={cls} style={style} aria-hidden="true" />;
}
