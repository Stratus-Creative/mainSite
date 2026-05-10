"use client";

import { useEffect, useRef } from "react";

export function CursorOrb() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (reduceMotion || isTouch) return;

    const parent = node.parentElement;
    if (!parent) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;
    let active = false;

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      if (!active) {
        currentX = targetX;
        currentY = targetY;
        active = true;
        node.classList.add("is-active");
      }
    };

    const onLeave = () => {
      active = false;
      node.classList.remove("is-active");
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      node.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} className="motion-cursor-orb" aria-hidden="true" />;
}
