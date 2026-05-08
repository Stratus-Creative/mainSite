export interface CaseStudy {
  slug: string;
  client: string;
  industry: string;
  pillar: "Websites" | "Workflows" | "Online presence";
  date: string; // ISO
  shortDescription: string;
  hero: { eyebrow: string; title: string; accent: string };
  problem: string;
  approach: string;
  outcome: { metric: string; value: string }[];
  details: string[];
  techStack: string[];
}

export const CASE_STUDIES: CaseStudy[] = [];

// Once we ship a project, add a case study here:
//
// {
//   slug: "client-name-project",
//   client: "Anonymous Plumbing Co.",
//   industry: "HVAC",
//   pillar: "Websites",
//   date: "2026-06-01",
//   shortDescription: "Single-page Starter site with auto-pulled Google reviews and a click-to-call hero.",
//   hero: {
//     eyebrow: "Case study · Local services",
//     title: "Plumbing site that ranked locally",
//     accent: "in 30 days.",
//   },
//   problem: "...",
//   approach: "...",
//   outcome: [
//     { metric: "Pages", value: "1" },
//     { metric: "Time to launch", value: "5 days" },
//     { metric: "Mobile LCP", value: "0.8s" },
//   ],
//   details: ["..."],
//   techStack: ["Next.js", "Vercel", "Resend"],
// },

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
