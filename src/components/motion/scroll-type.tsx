"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

interface Props {
  /** Plain string mode (back-compat). */
  text?: string;
  /**
   * Rich mode — pass JSX with inline spans, accent words, line breaks, etc.
   * Each text node is character-split while preserving wrapping element styling.
   */
  children?: ReactNode;
  /** Wrapper className — apply heading styles here (display-heading, text-4xl, etc.). */
  className?: string;
  /** Faint opacity for unrevealed letters. Default 0.18. */
  faint?: number;
  /** Per-character ramp size as fraction of total scroll progress. Default 0.08. */
  rampSize?: number;
  /** Inline style applied to wrapper. */
  style?: CSSProperties;
}

// ── Tree helpers ────────────────────────────────────────────────────────────

function countChars(node: ReactNode): number {
  if (node === null || node === undefined || typeof node === "boolean") return 0;
  if (typeof node === "string" || typeof node === "number") return String(node).length;
  if (Array.isArray(node)) return node.reduce<number>((sum, n) => sum + countChars(n), 0);
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return countChars(el.props.children);
  }
  return 0;
}

function plainText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(plainText).join("");
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return plainText(el.props.children);
  }
  return "";
}

interface TransformState {
  idx: { current: number };
  total: number;
  faint: number;
  rampSize: number;
}

function transform(
  node: ReactNode,
  state: TransformState,
  keyPrefix: string
): ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") return node;

  if (typeof node === "string" || typeof node === "number") {
    const text = String(node);
    return Array.from(text).map((char, i) => {
      const charIdx = state.idx.current++;
      const threshold = (charIdx + 1) / state.total;
      const start = Math.max(0, threshold - state.rampSize);
      const opacityCalc = `calc(${state.faint} + ${
        1 - state.faint
      } * clamp(0, (var(--st-progress, 0) - ${start.toFixed(
        4
      )}) / ${state.rampSize.toFixed(4)}, 1))`;
      return (
        <span
          key={`${keyPrefix}-${i}`}
          aria-hidden="true"
          style={{
            opacity: opacityCalc,
            display: char === " " ? "inline" : "inline-block",
            willChange: "opacity",
          }}
        >
          {char === " " ? " " : char}
        </span>
      );
    });
  }

  if (Array.isArray(node)) {
    return node.map((n, i) => transform(n, state, `${keyPrefix}-${i}`));
  }

  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    const newChildren = transform(el.props.children, state, keyPrefix);
    return cloneElement(el, { ...el.props, children: newChildren });
  }

  return node;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Scroll-driven typewriter reveal — characters fade from `faint` to full
 * opacity based on the wrapper's scroll position.
 *
 * Performance: only the wrapper's `--st-progress` CSS var updates on scroll
 * (single DOM write). Per-character opacity is computed in CSS via `calc()` —
 * React never re-renders children after mount.
 *
 * Honors `prefers-reduced-motion` (renders fully revealed, no listener).
 */
export function ScrollType({
  text,
  children,
  className,
  faint = 0.18,
  rampSize = 0.08,
  style,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);

  const content: ReactNode = children ?? text;
  const total = useMemo(() => countChars(content), [content]);
  const label = useMemo(() => plainText(content), [content]);

  const transformed = useMemo(() => {
    if (total === 0) return content;
    return transform(content, { idx: { current: 0 }, total, faint, rampSize }, "st");
  }, [content, total, faint, rampSize]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      node.style.setProperty("--st-progress", "1");
      return;
    }

    let frame: number | null = null;
    let attached = false;

    const calculate = () => {
      frame = null;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.8;
      const end = vh * 0.25;
      const center = (rect.top + rect.bottom) / 2;
      const p = (start - center) / (start - end);
      const clamped = Math.max(0, Math.min(1, p));
      node.style.setProperty("--st-progress", String(clamped));
    };

    const schedule = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(calculate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !attached) {
            attached = true;
            window.addEventListener("scroll", schedule, { passive: true });
            schedule();
          } else if (!entry.isIntersecting && attached) {
            attached = false;
            window.removeEventListener("scroll", schedule);
          }
        }
      },
      { rootMargin: "300px 0px 300px 0px" }
    );
    observer.observe(node);
    schedule();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span ref={ref} className={className} style={style} aria-label={label}>
      {transformed}
    </span>
  );
}
