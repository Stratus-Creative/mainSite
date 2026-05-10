import type { ReactNode } from "react";

interface ItemProps {
  year: string;
  title: string;
  children: ReactNode;
}

export function TimelineItem({ year, title, children }: ItemProps) {
  return (
    <div className="motion-timeline-item relative pl-8">
      <span
        aria-hidden="true"
        className="motion-timeline-dot absolute left-0 top-2 size-2 rounded-full bg-accent"
      />
      <span
        aria-hidden="true"
        className="motion-timeline-line absolute left-[3px] top-4 h-full w-px bg-border"
      />
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{year}</p>
      <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export function Timeline({ children }: { children: ReactNode }) {
  return <div className="space-y-10">{children}</div>;
}
