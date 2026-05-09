export async function triggerDeploy(): Promise<void> {
  const url = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!url) {
    console.warn("[deploy] VERCEL_DEPLOY_HOOK_URL not set — skipping redeploy");
    return;
  }
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    console.error("[deploy] Deploy hook failed:", res.status, await res.text());
  }
}
