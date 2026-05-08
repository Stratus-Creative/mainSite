import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Roadmap — Stratus Creative",
  description:
    "What Stratus Creative is shipping next, what's planned, and what's parked. Public, updated monthly.",
  alternates: { canonical: "https://stratus-creative.com/roadmap" },
};

interface RoadmapItem {
  title: string;
  detail: string;
}

const NOW: RoadmapItem[] = [
  {
    title: "Per-pillar landing pages",
    detail: "Three live (AI agents, local websites, workflows). Adding pages for online presence package and AI Care.",
  },
  {
    title: "Logo finalization",
    detail: "Iterating on the wordmark + mark with Gemini-generated concepts.",
  },
  {
    title: "Notes essays",
    detail: "Publishing one essay every 2–3 weeks on web, AI cost transparency, and process.",
  },
];

const NEXT: RoadmapItem[] = [
  {
    title: "Stratus AI chatbot",
    detail: "An on-site assistant that knows our pricing and services. Research plan complete; ships once we have inbound volume.",
  },
  {
    title: "Cal.com booking widget on /start",
    detail: "Self-serve discovery calls alongside the email form.",
  },
  {
    title: "Quote tracker page",
    detail: "Status page after /start submission so clients see their quote progress.",
  },
  {
    title: "More per-industry pages",
    detail: "Realtors, lawyers, restaurants, financial advisors — as we close clients in each vertical.",
  },
];

const LATER: RoadmapItem[] = [
  {
    title: "Live transparency page",
    detail: "Anonymized real-world cost and uptime data from our hosted clients. Activates with 5+ AI clients.",
  },
  {
    title: "Public uptime status",
    detail: "Real-time uptime + incident log for hosted client sites.",
  },
  {
    title: "Email re-engagement automation",
    detail: "Drip sequence for prospects who didn't convert immediately. Designed and parked.",
  },
  {
    title: "Internal admin dashboard",
    detail: "Single view of all client AI workflows, cost, uptime, monitoring alerts.",
  },
];

const PARKED: RoadmapItem[] = [
  {
    title: "Paid ads service",
    detail: "Decided against. We refer to specialist partners.",
  },
  {
    title: "Social media management",
    detail: "Decided against. Different muscle from what we do.",
  },
  {
    title: "WordPress / inherited-codebase maintenance",
    detail: "Decided against. We can rebuild faster than we can maintain inheriteds.",
  },
];

export default function PublicRoadmapPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="section-label">Roadmap · Public · Updated monthly</p>
            <h1 className="display-heading mt-8 max-w-4xl text-4xl sm:text-6xl lg:text-7xl">
              What we&apos;re{" "}
              <span className="text-accent">building.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-base text-muted-foreground">
              Most agencies hide their roadmap. We publish it. Here&apos;s
              what&apos;s in flight, what&apos;s next, and what we&apos;ve
              decided not to build.
            </p>
          </div>
        </section>

        <RoadmapSection
          label="Now · in flight"
          headline="What we're shipping this quarter."
          items={NOW}
          accent
        />
        <RoadmapSection
          label="Next · this year"
          headline="Planned, scoped, ready to start."
          items={NEXT}
        />
        <RoadmapSection
          label="Later · when the time is right"
          headline="On the radar, waiting for signal."
          items={LATER}
        />
        <RoadmapSection
          label="Parked · won't build"
          headline="Things we've decided are not for us."
          items={PARKED}
          muted
        />

        <section className="border-t border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
            <p className="section-label">Have an idea?</p>
            <p className="mt-6 text-lg leading-relaxed text-foreground">
              If there&apos;s something you wish Stratus did, tell us. We
              read every message and take real suggestions seriously.
            </p>
            <Link
              href="/start"
              className="mt-8 inline-flex items-center gap-2 text-sm text-foreground"
            >
              <span className="underline-hover">Send us a note</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function RoadmapSection({
  label,
  headline,
  items,
  accent,
  muted,
}: {
  label: string;
  headline: string;
  items: RoadmapItem[];
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p
              className={`section-label ${
                accent ? "text-accent" : muted ? "opacity-60" : ""
              }`}
            >
              {label}
            </p>
            <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
              {headline}
            </h2>
          </div>
          <div className="lg:col-span-8">
            <ul className="divide-y divide-border/60 border-y border-border/60">
              {items.map((item) => (
                <li key={item.title} className="py-5 lg:py-6">
                  <p className="text-base font-medium tracking-tight">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
