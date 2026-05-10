"use client";
import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
  html?: string;
  className?: string;
}

export function DropCap({ children, html, className }: Props) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.classList.add("is-active");
  }, []);
  const cls = ["motion-drop-cap", className].filter(Boolean).join(" ");
  if (html !== undefined) {
    return (
      <p
        ref={ref}
        className={cls}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <p ref={ref} className={cls}>
      {children}
    </p>
  );
}
