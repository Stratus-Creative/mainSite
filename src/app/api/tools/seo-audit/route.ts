import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { recordAiUsage } from "@/lib/ai-usage";
import { getClientIp } from "@/lib/rate-limit";

const MODEL_ID = "claude-haiku-4-5-20251001";
const MAX_HTML_BYTES = 500 * 1024;
const FETCH_TIMEOUT_MS = 8000;

// In-memory rate limit: 5 requests per IP per hour.
type RateBucket = { count: number; resetAt: number };
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitStore = new Map<string, RateBucket>();

function checkInMemoryRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitStore.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return false;
  }
  bucket.count += 1;
  return true;
}

const SYSTEM_PROMPT = `You are an SEO auditor for a small-business website. Given extracted signals from the homepage HTML, output a structured audit in strict JSON only:

{
  "overallScore": 0-10,
  "takeaway": "one-sentence summary in James's voice — direct, specific, no fluff",
  "categories": [
    {
      "name": "Page basics" | "Local signals" | "Content & structure" | "Technical" | "Local SEO opportunities",
      "findings": [
        { "status": "pass" | "warn" | "critical", "title": "...", "finding": "...", "fix": "..." }
      ]
    }
  ]
}

Voice: direct, specific, plain English. No "Great question!", no exclamation points, no jargon. Match the tone of a senior engineer reviewing a colleague's code: factual, helpful, no praise inflation. The audit should be useful even for a non-technical small business owner.

Always return all five categories in order: Page basics, Local signals, Content & structure, Technical, Local SEO opportunities. Each category should contain 2-4 findings. Score should reflect the actual signals — don't inflate. Return the JSON object only — no preamble, no commentary.`;

type Finding = {
  status: "pass" | "warn" | "critical";
  title: string;
  finding: string;
  fix: string;
};

type Category = {
  name: string;
  findings: Finding[];
};

type Audit = {
  overallScore: number;
  takeaway: string;
  categories: Category[];
};

function isFinding(v: unknown): v is Finding {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    (r.status === "pass" || r.status === "warn" || r.status === "critical") &&
    typeof r.title === "string" &&
    typeof r.finding === "string" &&
    typeof r.fix === "string"
  );
}

function isCategory(v: unknown): v is Category {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.name === "string" &&
    Array.isArray(r.findings) &&
    r.findings.every(isFinding)
  );
}

function isAudit(v: unknown): v is Audit {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.overallScore === "number" &&
    typeof r.takeaway === "string" &&
    Array.isArray(r.categories) &&
    r.categories.every(isCategory)
  );
}

function parseAuditJson(raw: string): Audit | null {
  const trimmed = raw.trim();

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (isAudit(parsed)) return parsed;
  } catch {
    // fall through
  }

  const fenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  if (fenced !== trimmed) {
    try {
      const parsed: unknown = JSON.parse(fenced);
      if (isAudit(parsed)) return parsed;
    } catch {
      // fall through
    }
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed: unknown = JSON.parse(match[0]);
      if (isAudit(parsed)) return parsed;
    } catch {
      // fall through
    }
  }

  return null;
}

// ---------- HTML signal extraction ----------

type SeoSignals = {
  finalUrl: string;
  isHttps: boolean;
  title: string | null;
  metaDescription: string | null;
  hasViewport: boolean;
  hasCanonical: boolean;
  canonicalHref: string | null;
  h1Count: number;
  firstH1: string | null;
  h2Count: number;
  hasClickToCall: boolean;
  telLinks: string[];
  hasJsonLd: boolean;
  jsonLdLength: number;
  jsonLdSnippets: string[];
  approxWordCount: number;
  businessNameInTitle: boolean;
  businessNameInH1: boolean;
  cityInTitle: boolean;
  cityInH1: boolean;
  cityInBody: boolean;
  hasOgTitle: boolean;
  hasOgDescription: boolean;
  hasFavicon: boolean;
  hasAddressTag: boolean;
  hasMailto: boolean;
  hasMapEmbed: boolean;
  imgCount: number;
  imgMissingAlt: number;
};

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSignals(
  html: string,
  finalUrl: string,
  businessName: string,
  cityState: string
): SeoSignals {
  const isHttps = finalUrl.toLowerCase().startsWith("https://");

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).trim() : null;

  const metaDescMatch = html.match(
    /<meta\s+[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["']/i
  ) ||
    html.match(
      /<meta\s+[^>]*content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']description["']/i
    );
  const metaDescription = metaDescMatch ? decodeEntities(metaDescMatch[1]).trim() : null;

  const hasViewport = /<meta\s+[^>]*name\s*=\s*["']viewport["']/i.test(html);

  const canonicalMatch = html.match(
    /<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']*)["']/i
  ) ||
    html.match(
      /<link\s+[^>]*href\s*=\s*["']([^"']*)["'][^>]*rel\s*=\s*["']canonical["']/i
    );
  const hasCanonical = !!canonicalMatch;
  const canonicalHref = canonicalMatch ? canonicalMatch[1] : null;

  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Count = h1Matches.length;
  const firstH1 = h1Count > 0 ? stripTags(h1Matches[0][1]).slice(0, 200) : null;

  const h2Matches = [...html.matchAll(/<h2\b[^>]*>/gi)];
  const h2Count = h2Matches.length;

  const telMatches = [...html.matchAll(/href\s*=\s*["']tel:([^"']+)["']/gi)];
  const telLinks = telMatches.map((m) => m[1]).slice(0, 5);
  const hasClickToCall = telLinks.length > 0;

  const jsonLdMatches = [
    ...html.matchAll(
      /<script\s+[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];
  const hasJsonLd = jsonLdMatches.length > 0;
  const jsonLdLength = jsonLdMatches.reduce((acc, m) => acc + m[1].length, 0);
  const jsonLdSnippets = jsonLdMatches.map((m) => m[1].trim().slice(0, 300)).slice(0, 3);

  const bodyText = stripTags(html);
  const approxWordCount = bodyText ? bodyText.split(/\s+/).length : 0;

  const nameLower = businessName.toLowerCase();
  const cityLower = cityState.split(",")[0].trim().toLowerCase(); // city portion only
  const titleLower = (title ?? "").toLowerCase();
  const h1Lower = (firstH1 ?? "").toLowerCase();
  const bodyHead = bodyText.slice(0, 1000).toLowerCase();

  const businessNameInTitle = nameLower.length > 0 && titleLower.includes(nameLower);
  const businessNameInH1 = nameLower.length > 0 && h1Lower.includes(nameLower);
  const cityInTitle = cityLower.length > 0 && titleLower.includes(cityLower);
  const cityInH1 = cityLower.length > 0 && h1Lower.includes(cityLower);
  const cityInBody = cityLower.length > 0 && bodyHead.includes(cityLower);

  const hasOgTitle = /<meta\s+[^>]*property\s*=\s*["']og:title["']/i.test(html);
  const hasOgDescription = /<meta\s+[^>]*property\s*=\s*["']og:description["']/i.test(html);
  const hasFavicon = /<link\s+[^>]*rel\s*=\s*["'][^"']*icon[^"']*["']/i.test(html);
  const hasAddressTag = /<address\b/i.test(html);
  const hasMailto = /href\s*=\s*["']mailto:/i.test(html);
  const hasMapEmbed = /maps\.google|google\.com\/maps|maps\.googleapis|<iframe[^>]*google\.com\/maps/i.test(html);

  const imgMatches = [...html.matchAll(/<img\b[^>]*>/gi)];
  const imgCount = imgMatches.length;
  const imgMissingAlt = imgMatches.filter((m) => !/\balt\s*=\s*["']/i.test(m[0])).length;

  return {
    finalUrl,
    isHttps,
    title,
    metaDescription,
    hasViewport,
    hasCanonical,
    canonicalHref,
    h1Count,
    firstH1,
    h2Count,
    hasClickToCall,
    telLinks,
    hasJsonLd,
    jsonLdLength,
    jsonLdSnippets,
    approxWordCount,
    businessNameInTitle,
    businessNameInH1,
    cityInTitle,
    cityInH1,
    cityInBody,
    hasOgTitle,
    hasOgDescription,
    hasFavicon,
    hasAddressTag,
    hasMailto,
    hasMapEmbed,
    imgCount,
    imgMissingAlt,
  };
}

function buildPrompt(
  businessName: string,
  cityState: string,
  websiteUrl: string,
  signals: SeoSignals
): string {
  return `BUSINESS:
Name: ${businessName}
Location: ${cityState}
Website: ${websiteUrl}

EXTRACTED SIGNALS FROM HOMEPAGE HTML:
${JSON.stringify(signals, null, 2)}

Return the audit JSON object only — no preamble, no commentary.`;
}

// ---------- Route ----------

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkInMemoryRateLimit(ip)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const businessName =
      typeof body.businessName === "string" ? body.businessName.trim() : "";
    const cityState =
      typeof body.cityState === "string" ? body.cityState.trim() : "";
    const websiteUrlRaw =
      typeof body.websiteUrl === "string" ? body.websiteUrl.trim() : "";

    if (!businessName || !cityState || !websiteUrlRaw) {
      return NextResponse.json(
        { error: "missing_fields", details: "businessName, cityState, and websiteUrl are required." },
        { status: 400 }
      );
    }

    if (businessName.length > 200 || cityState.length > 200 || websiteUrlRaw.length > 500) {
      return NextResponse.json(
        { error: "fields_too_long" },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(websiteUrlRaw);
    } catch {
      return NextResponse.json(
        { error: "invalid_url", details: "Include the full URL with https://" },
        { status: 400 }
      );
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "invalid_protocol", details: "Only http and https URLs are supported." },
        { status: 400 }
      );
    }

    const websiteUrl = parsedUrl.toString();

    // Fetch the site HTML
    let res: Response;
    try {
      res = await fetch(websiteUrl, {
        headers: {
          "User-Agent":
            "StratusCreativeAuditor/1.0 (+https://stratus-creative.com/tools/seo-audit)",
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        redirect: "follow",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown fetch error";
      return NextResponse.json(
        { error: "Couldn't reach that URL", details: message },
        { status: 200 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "Couldn't reach that URL",
          details: `Server returned ${res.status} ${res.statusText}`,
        },
        { status: 200 }
      );
    }

    let html = await res.text();
    if (html.length > MAX_HTML_BYTES) {
      html = html.slice(0, MAX_HTML_BYTES);
    }

    const finalUrl = res.url || websiteUrl;
    const signals = extractSignals(html, finalUrl, businessName, cityState);

    const { text, usage } = await generateText({
      model: anthropic(MODEL_ID),
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(businessName, cityState, websiteUrl, signals),
      maxOutputTokens: 1500,
    });

    const audit = parseAuditJson(text);
    if (!audit) {
      console.error("[seo-audit] failed to parse JSON:", text.slice(0, 500));
      return NextResponse.json({ error: "parse_failed" }, { status: 500 });
    }

    void recordAiUsage(
      "seo_audit",
      MODEL_ID,
      usage?.inputTokens ?? 0,
      usage?.outputTokens ?? 0,
      { url: websiteUrl }
    );

    return NextResponse.json({
      ok: true,
      audit,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[seo-audit]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
