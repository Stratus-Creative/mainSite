import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBar } from "@/components/admin-bar";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";
import { WebhooksManager } from "./webhooks-manager";

export const metadata: Metadata = {
  title: "Webhooks — Stratus Admin",
  robots: { index: false, follow: false },
};

type Subscription = {
  id: string;
  url: string;
  label: string | null;
  events: string[];
  active: boolean;
  secret: string | null;
  created_at: string;
};

const labelClass =
  "font-mono text-[10px] uppercase tracking-widest text-muted-foreground";

const CURL_EXAMPLE = `# Stratus Creative will POST a JSON body like this to your URL:
{
  "event": "submission.created",
  "timestamp": "2026-05-09T12:00:00.000Z",
  "data": {
    "id": "uuid",
    "business_name": "Acme Roofing",
    "owner_name": "Jane Doe",
    "email": "jane@acme.com",
    "source": "start-form",
    "project_type": "roofing"
  }
}

# Headers:
#   Content-Type: application/json
#   User-Agent: Stratus-Creative-Webhook/1
#   X-Stratus-Signature: sha256=<hex>   (only if a secret is set)`;

const VERIFY_EXAMPLE = `// Verify signatures in your handler (Node):
import crypto from "node:crypto";

function verify(body, signature, secret) {
  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`;

export default async function WebhooksPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const supabase = createServerClient();
  const { data } = await supabase
    .from("webhook_subscriptions")
    .select("id, url, label, events, active, secret, created_at")
    .order("created_at", { ascending: false });

  const subscriptions = (data ?? []) as Subscription[];

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to admin
          </Link>
        </div>

        <header className="mb-10">
          <p className={labelClass}>Integrations</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Webhooks
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Send real-time pings to Slack, Discord, Zapier, or anything else
            when key events happen.
          </p>
        </header>

        {/* Docs panel */}
        <details className="mb-10 rounded-lg border border-border/60 bg-card/40 p-5 open:bg-card/60">
          <summary className="cursor-pointer text-sm font-medium tracking-tight">
            Payload shape & signature verification
          </summary>
          <div className="mt-4 grid gap-4">
            <div>
              <p className={labelClass}>Payload</p>
              <pre className="mt-2 overflow-x-auto rounded border border-border/60 bg-background p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
                {CURL_EXAMPLE}
              </pre>
            </div>
            <div>
              <p className={labelClass}>Verify HMAC-SHA256</p>
              <pre className="mt-2 overflow-x-auto rounded border border-border/60 bg-background p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
                {VERIFY_EXAMPLE}
              </pre>
            </div>
          </div>
        </details>

        <WebhooksManager initialSubscriptions={subscriptions} />
      </main>
    </div>
  );
}
