"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MENU_GROUPS: Array<{
  label: string;
  items: Array<{ label: string; href: string }>;
}> = [
  {
    label: "Pipeline",
    items: [
      { label: "Submissions", href: "/admin" },
      { label: "Inbox", href: "/admin/inbox" },
      { label: "Analytics", href: "/admin/analytics" },
      { label: "Email templates", href: "/admin/email-templates" },
    ],
  },
  {
    label: "Chat & AI",
    items: [
      { label: "Chats", href: "/admin/chats" },
      { label: "Bot stats", href: "/admin/bot-stats" },
      { label: "Bot tone", href: "/admin/bot-tone" },
      { label: "Prompts", href: "/admin/prompts" },
      { label: "AI costs", href: "/admin/ai-costs" },
    ],
  },
  {
    label: "Audience",
    items: [
      { label: "Subscribers", href: "/admin/subscribers" },
      { label: "Notes", href: "/admin/notes" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Activity log", href: "/admin/activity" },
      { label: "Webhooks", href: "/admin/webhooks" },
      { label: "System status", href: "/admin/status" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Account", href: "/admin/account" },
      { label: "Team", href: "/admin/team" },
      { label: "Sessions", href: "/admin/sessions" },
    ],
  },
];

export function AdminBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/admin" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <span aria-hidden="true" className="inline-block size-2 rounded-full bg-accent" />
          <span>Stratus Admin</span>
        </Link>

        <div className="flex items-center gap-6">
          {/* Menu dropdown — every admin destination, one click away */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Menu
              <span aria-hidden="true" className={`text-[8px] transition-transform ${open ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-3 w-[min(90vw,32rem)] origin-top-right rounded-xl border border-border bg-background p-5 shadow-2xl shadow-black/40"
              >
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  {MENU_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                        {group.label}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {group.items.map((item) => {
                          const active =
                            pathname === item.href ||
                            (item.href !== "/admin" && pathname?.startsWith(item.href));
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className={`block text-sm transition-colors ${
                                  active
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
