"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** ms — additional delay before reveal triggers */
  delay?: number;
  /** Distance from viewport edge (CSS rootMargin) — negative pulls the trigger earlier */
  threshold?: string;
  as?: ElementType;
  className?: string;
}

/**
 * Reveals its children when scrolled into view via Intersection Observer.
 * Single observer per element, disconnects after first reveal — minimal cost.
 * Honors `prefers-reduced-motion` automatically via CSS.
 */
export function ScrollReveal({
  children,
  delay = 0,
  threshold = "0px 0px -10% 0px",
  as: Tag = "div",
  className,
  style,
  ...rest
}: Props) {
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
      { rootMargin: threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  const motionStyle: CSSProperties = {
    ...style,
    ...(delay ? ({ "--motion-delay": `${delay}ms` } as CSSProperties) : {}),
  };
  const cls = ["motion-reveal", revealed ? "is-in-view" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={cls}
      style={motionStyle}
      {...rest}
    >
      {children}
    </Tag>
  );
}
