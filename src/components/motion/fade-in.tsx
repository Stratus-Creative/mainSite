import type { ElementType, HTMLAttributes, ReactNode, CSSProperties } from "react";

type Variant = "up" | "fade" | "scale" | "slide-left" | "number";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** ms — adds animation-delay for staggered entrances */
  delay?: number;
  /**
   * Visual variant — assign by semantic role:
   * - `up` (default) — body/headlines/cards
   * - `slide-left` — eyebrow / section labels (auto-draws the leading rule)
   * - `number` — large numerals (prices, stats) — bigger scale-in for impact
   * - `scale` — generic scale-in
   * - `fade` — opacity-only when movement would be wrong (sticky elements, etc.)
   */
  variant?: Variant;
  /** Render as a different element (default: div). Useful for `as="section"` etc. */
  as?: ElementType;
  className?: string;
}

const VARIANT_CLASS: Record<Variant, string> = {
  up: "motion-enter",
  fade: "motion-enter-fade",
  scale: "motion-enter-scale",
  "slide-left": "motion-enter-slide-left",
  number: "motion-enter-number",
};

/**
 * Server-renderable entrance wrapper. Adds a CSS animation class on render —
 * no JS, no hydration cost, GPU-accelerated. Pair with `delay` for stagger.
 */
export function FadeIn({
  children,
  delay = 0,
  variant = "up",
  as: Tag = "div",
  className,
  style,
  ...rest
}: Props) {
  const motionStyle: CSSProperties = {
    ...style,
    ...(delay ? ({ "--motion-delay": `${delay}ms` } as CSSProperties) : {}),
  };
  const cls = [VARIANT_CLASS[variant], className].filter(Boolean).join(" ");
  return (
    <Tag className={cls} style={motionStyle} {...rest}>
      {children}
    </Tag>
  );
}
