"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminBar() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/admin" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <span aria-hidden="true" className="inline-block size-2 rounded-full bg-accent" />
          <span>Stratus Admin</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            target="_blank"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View site ↗
          </Link>
          <button
            onClick={logout}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
