import type { MetadataRoute } from "next";
import { COMPARISONS } from "@/lib/comparison-data";
import { PILLAR_PAGES, INDUSTRY_PAGES } from "@/lib/landing-data";
import { NOTES } from "@/lib/notes-data";
import { CASE_STUDIES } from "@/lib/case-studies-data";

const BASE_URL = "https://stratus-creative.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const LAST_REDESIGN = new Date("2026-04-01");

  const core: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: LAST_REDESIGN, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/services`, lastModified: LAST_REDESIGN, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: LAST_REDESIGN, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/work`, lastModified: LAST_REDESIGN, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/start`, lastModified: LAST_REDESIGN, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: LAST_REDESIGN, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/notes`, lastModified: LAST_REDESIGN, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/tools`, lastModified: LAST_REDESIGN, changeFrequency: "monthly", priority: 0.7 },
    {
      url: `${BASE_URL}/tools/cost-estimator`,
      lastModified: LAST_REDESIGN,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/resources/website-cost-guide`,
      lastModified: LAST_REDESIGN,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/resources/free-website-audit`,
      lastModified: LAST_REDESIGN,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    { url: `${BASE_URL}/testimonials`, lastModified: LAST_REDESIGN, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/roadmap`, lastModified: LAST_REDESIGN, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/press`, lastModified: LAST_REDESIGN, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/transparency`, lastModified: LAST_REDESIGN, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/status`, lastModified: LAST_REDESIGN, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/support`, lastModified: LAST_REDESIGN, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: LAST_REDESIGN, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: LAST_REDESIGN, changeFrequency: "yearly", priority: 0.3 },
  ];

  const notes: MetadataRoute.Sitemap = NOTES.map((n) => ({
    url: `${BASE_URL}/notes/${n.slug}`,
    lastModified: new Date(n.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const pillarPages: MetadataRoute.Sitemap = Object.keys(PILLAR_PAGES).map(
    (slug) => ({
      url: `${BASE_URL}/services/${slug}`,
      lastModified: LAST_REDESIGN,
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  const industryPages: MetadataRoute.Sitemap = Object.keys(INDUSTRY_PAGES).map(
    (slug) => ({
      url: `${BASE_URL}/for/${slug}`,
      lastModified: LAST_REDESIGN,
      changeFrequency: "monthly",
      priority: 0.75,
    })
  );

  const comparisonPages: MetadataRoute.Sitemap = Object.keys(COMPARISONS).map(
    (slug) => ({
      url: `${BASE_URL}/vs/${slug}`,
      lastModified: LAST_REDESIGN,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  const caseStudies: MetadataRoute.Sitemap = CASE_STUDIES.map((c) => ({
    url: `${BASE_URL}/work/${c.slug}`,
    lastModified: new Date(c.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...core,
    ...notes,
    ...pillarPages,
    ...industryPages,
    ...comparisonPages,
    ...caseStudies,
  ];
}
