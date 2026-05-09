export function firstName(name: string | null | undefined): string | null {
  if (!name) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  const first = trimmed.split(/\s+/)[0];
  return first || null;
}

export function greeting(name: string | null | undefined): string {
  const first = firstName(name);
  return first ? `Hello ${first},` : "Hello,";
}

export function humanize(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const cleaned = slug.replace(/[-_]/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

const BUDGET_LABELS: Record<string, string> = {
  "under-2k": "Under $2K",
  "2k-5k": "$2K – $5K",
  "5k-15k": "$5K – $15K",
  "15k-plus": "$15K+",
  unsure: "Unsure",
};

export function humanizeBudget(budget: string | null | undefined): string | null {
  if (!budget) return null;
  return BUDGET_LABELS[budget] ?? humanize(budget);
}

export function formatLongDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(amount: number | null | undefined): string | null {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
