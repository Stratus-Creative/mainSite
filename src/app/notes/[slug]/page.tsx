import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAllNotesSlugs, getNote } from "@/lib/notes";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/structured-data";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { FadeIn, DropCap } from "@/components/motion";

export const revalidate = 600;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // If Supabase isn't reachable at build time (missing env vars on a preview
  // deploy, etc.), return empty params — pages will render on-demand via ISR
  // instead of taking down the build.
  try {
    const slugs = await getAllNotesSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (err) {
    console.warn(
      "[generateStaticParams] couldn't pre-render note slugs, falling back to on-demand:",
      err
    );
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNote(slug);
  if (!note) return { title: "Not found" };
  return {
    title: `${note.title} — Stratus Creative`,
    description: note.description,
    alternates: { canonical: `https://stratus-creative.com/notes/${slug}` },
    openGraph: {
      title: note.title,
      description: note.description,
      type: "article",
      publishedTime: note.published_at ?? undefined,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Reject any URL that isn't relative, http(s), or mailto. Prevents
// `[text](javascript:...)` from rendering as a live XSS vector even though
// admin-authored content is the only source today.
function safeHref(raw: string): string {
  const trimmed = raw.trim();
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed)
  ) {
    return trimmed;
  }
  return "#";
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function renderInline(html: string): string {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_m, label: string, url: string) =>
        `<a href="${escapeAttr(safeHref(url))}" class="underline-hover text-foreground">${label}</a>`
    );
}

// Minimal markdown renderer — supports paragraphs, **bold**, [text](url), bullet lists
function renderBody(body: string) {
  const paragraphs = body.split(/\n\n+/);
  let firstParaUsed = false;
  return paragraphs.map((para, i) => {
    const html = renderInline(para);

    if (para.startsWith("- ")) {
      const items = para
        .split("\n")
        .filter((line) => line.startsWith("- "))
        .map((line) => renderInline(line.slice(2)));
      return (
        <ul key={i} className="my-6 space-y-2 text-base text-muted-foreground">
          {items.map((item, j) => (
            <li key={j} className="flex gap-3">
              <span aria-hidden="true" className="text-accent">
                •
              </span>
              <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ul>
      );
    }

    if (!firstParaUsed) {
      firstParaUsed = true;
      return (
        <DropCap
          key={i}
          className="my-6 text-base leading-relaxed text-muted-foreground sm:text-lg"
          html={html}
        />
      );
    }

    return (
      <p
        key={i}
        className="my-6 text-base leading-relaxed text-muted-foreground sm:text-lg"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

export default async function NotePage({ params }: Params) {
  const { slug } = await params;
  const note = await getNote(slug);
  if (!note) notFound();

  return (
    <>
      <ArticleJsonLd
        title={note.title}
        description={note.description}
        date={note.published_at!}
        slug={note.slug}
        tags={note.tags}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Decoded", url: "/notes" },
          { name: note.title, url: `/notes/${note.slug}` },
        ]}
      />
      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-20 lg:py-24">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">←</span> Back to Decoded
          </Link>

          <FadeIn className="mt-10">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {formatDate(note.published_at!)}
            </p>
            <h1 className="display-heading mt-6 text-4xl sm:text-5xl lg:text-6xl">
              {note.title}
            </h1>
            <div className="mt-6 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </FadeIn>

          <div className="mt-12 border-t border-border/60 pt-12">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              By{" "}
              <Link href="/about" className="text-foreground underline-hover">
                James Farmer
              </Link>{" "}
              · Founder, Stratus Creative
            </p>
            <div className="mt-8">{renderBody(note.body)}</div>
          </div>

          <div className="mt-16 border-t border-border/60 pt-12">
            <NewsletterSignup variant="inline" />
          </div>

          <div className="mt-16 flex flex-col gap-3 border-t border-border/60 pt-8 sm:flex-row sm:justify-between">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span aria-hidden="true">←</span> All Decoded
            </Link>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 text-sm text-foreground"
            >
              <span className="underline-hover">Start a project</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
