import type { CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** ms — when the underline begins drawing. Default 600ms (after typical headline entrance lands). */
  delay?: number;
  className?: string;
}

/**
 * Wraps an inline accent word (typically inside a headline) and draws a thin
 * underline beneath it on mount. Use sparingly — once per headline at most.
 * The underline color inherits `currentColor` so it matches the wrapped text.
 */
export function AccentSweep({ children, delay = 600, className }: Props) {
  const style: CSSProperties = delay
    ? ({ "--motion-delay": `${delay}ms` } as CSSProperties)
    : {};
  const cls = ["motion-accent-sweep", className].filter(Boolean).join(" ");
  return (
    <span className={cls} style={style}>
      {children}
    </span>
  );
}
