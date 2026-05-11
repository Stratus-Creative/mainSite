"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { TextStreamChatTransport } from "ai";
import Link from "next/link";

const HIDDEN_PATHS = ["/support", "/success", "/cancel", "/admin"];
const NUDGE_PATHS = ["/pricing", "/services"];
const NUDGE_KEY = "stratus_nudge_shown";
const NUDGE_DELAY_MS = 45_000;
const NUDGE_SCROLL_THRESHOLD = 0.6;
const MAX_SESSION_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;
const MESSAGE_WARN_CHARS = 1500;
const INQUIRY_KEY = "stratus_inquiry_submitted";
const MIN_PANEL_WIDTH = 300;
const MIN_PANEL_HEIGHT = 380;
const MAX_PANEL_WIDTH = 560;
const MAX_PANEL_HEIGHT = 660;

interface InquiryCardData {
  email: string;
  projectType?: string;
  summary: string;
}

function parseInquiryCard(text: string): {
  before: string;
  card: InquiryCardData | null;
  after: string;
  partial: boolean;
} {
  const startIdx = text.indexOf("<inquiry-card");
  if (startIdx === -1) return { before: text, card: null, after: "", partial: false };

  const tail = text.slice(startIdx);
  const match = tail.match(/<inquiry-card\s+([^>]*?)\s*\/?>(?:<\/inquiry-card>)?/);
  if (!match) {
    return { before: text.slice(0, startIdx).trim(), card: null, after: "", partial: true };
  }

  const attrs: Record<string, string> = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let m;
  while ((m = attrRegex.exec(match[1]))) {
    attrs[m[1]] = m[2];
  }

  if (!attrs.email || !attrs.summary) {
    return { before: text.slice(0, startIdx).trim(), card: null, after: "", partial: true };
  }

  const cardEnd = startIdx + match[0].length;
  return {
    before: text.slice(0, startIdx).trim(),
    card: {
      email: attrs.email,
      projectType: attrs.projectType,
      summary: attrs.summary,
    },
    after: text.slice(cardEnd).trim(),
    partial: false,
  };
}

function getMessageText(m: UIMessage): string {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function buildStartUrl(allMessages: UIMessage[]): string {
  const userContext = allMessages
    .filter((m) => m.role === "user")
    .map(getMessageText)
    .join(". ")
    .trim();
  if (!userContext) return "/start";
  return `/start?summary=${encodeURIComponent(userContext.slice(0, 400))}`;
}

// Renders bot message text: **bold**, /path links, and newlines.
// /start gets special styling and carries conversation prefill context.
function renderMessageText(text: string, startUrl: string): ReactNode {
  const TOKEN_RE = /(\*\*[^*\n]+\*\*|(?<![a-zA-Z0-9])\/[\w-][\w/-]+)/g;
  const nodes: ReactNode[] = [];
  const lines = text.split("\n");

  lines.forEach((line, li) => {
    if (li > 0) nodes.push(<br key={`nl-${li}`} />);

    let last = 0;
    const re = new RegExp(TOKEN_RE.source, "g");
    let match: RegExpExecArray | null;

    while ((match = re.exec(line)) !== null) {
      if (match.index > last) {
        nodes.push(<span key={`${li}-t-${last}`}>{line.slice(last, match.index)}</span>);
      }
      const token = match[0];
      const key = `${li}-${match.index}`;

      if (token.startsWith("**")) {
        nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
      } else {
        const isStart = token === "/start";
        nodes.push(
          <Link
            key={key}
            href={isStart ? startUrl : token}
            className={
              isStart
                ? "inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-0.5 text-[11px] font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
                : "underline underline-offset-2 hover:text-accent"
            }
          >
            {isStart ? "Start your project →" : token}
          </Link>
        );
      }
      last = match.index + token.length;
    }

    if (last < line.length) {
      nodes.push(<span key={`${li}-t-end`}>{line.slice(last)}</span>);
    }
  });

  return <>{nodes}</>;
}

interface StartCtaData {
  plan: string;
  name?: string;
  business?: string;
  summary: string;
}

function parseStartCta(text: string): {
  before: string;
  cta: StartCtaData | null;
  after: string;
  partial: boolean;
} {
  const startIdx = text.indexOf("<start-cta");
  if (startIdx === -1) return { before: text, cta: null, after: "", partial: false };

  const tail = text.slice(startIdx);
  const match = tail.match(/<start-cta\s+([^>]*?)\s*\/?>(?:<\/start-cta>)?/);
  if (!match) {
    return { before: text.slice(0, startIdx).trim(), cta: null, after: "", partial: true };
  }

  const attrs: Record<string, string> = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let m;
  while ((m = attrRegex.exec(match[1]))) {
    attrs[m[1]] = m[2];
  }

  if (!attrs.summary) {
    return { before: text.slice(0, startIdx).trim(), cta: null, after: "", partial: true };
  }

  const ctaEnd = startIdx + match[0].length;
  return {
    before: text.slice(0, startIdx).trim(),
    cta: {
      plan: attrs.plan ?? "unsure",
      name: attrs.name || undefined,
      business: attrs.business || undefined,
      summary: attrs.summary,
    },
    after: text.slice(ctaEnd).trim(),
    partial: false,
  };
}

function buildStartCtaUrl(cta: StartCtaData): string {
  const params = new URLSearchParams();
  params.set("plan", cta.plan);
  params.set("summary", cta.summary.slice(0, 400));
  if (cta.name) params.set("name", cta.name);
  if (cta.business) params.set("business", cta.business);
  return `/start?${params.toString()}`;
}

function StartCtaCard({ data }: { data: StartCtaData }) {
  const href = buildStartCtaUrl(data);
  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/5 p-3.5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
        Ready to start
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">{data.summary}</p>
      <Link
        href={href}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-xs font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        Open the start form →
      </Link>
    </div>
  );
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "stratus_chat_session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
  }
  return id;
}

type Position = { x: number; y: number };

function InquiryCard({ data }: { data: InquiryCardData }) {
  const existingSubmission =
    typeof window !== "undefined" ? sessionStorage.getItem(INQUIRY_KEY) : null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState(data.email);
  const [state, setState] = useState<"idle" | "submitting" | "sent" | "error">(
    existingSubmission ? "sent" : "idle",
  );
  const [submissionId, setSubmissionId] = useState<string | null>(existingSubmission);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || state === "submitting" || state === "sent") return;
    setState("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "chat-widget",
          category: "chat-widget",
          email: email.trim(),
          ownerName: name.trim() || undefined,
          projectType: data.projectType ?? "unsure",
          message: data.summary,
          sessionId: getSessionId(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 429) {
        setErrorMessage("Too many submissions today — please use /start instead.");
        setState("error");
        return;
      }
      if (!res.ok || !json.id) {
        setErrorMessage("Couldn't send. Try again or use /start.");
        setState("error");
        return;
      }
      sessionStorage.setItem(INQUIRY_KEY, json.id);
      setSubmissionId(json.id);
      setState("sent");
    } catch {
      setErrorMessage("Network error. Try again or use /start.");
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent/10 p-3.5 text-sm">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          Sent to James
        </p>
        <p className="mt-2 text-foreground">
          Reply within 4 hours during business hours.
        </p>
        {submissionId && (
          <Link
            href={`/quote/${submissionId}`}
            className="mt-2 inline-flex items-center gap-1 text-xs text-foreground"
          >
            <span className="underline-hover">Track your quote</span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 text-sm">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Send to James
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{data.summary}</p>
      <div className="mt-3 space-y-2">
        <label className="block">
          <span className="sr-only">Your name (optional)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            maxLength={80}
            aria-label="Your name (optional)"
            className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="sr-only">Email address</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            maxLength={254}
            required
            aria-label="Email address"
            className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={state === "submitting" || !email.trim()}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-xs font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
      >
        {state === "submitting" ? "Sending…" : "Send to James"}
        {state !== "submitting" && <span aria-hidden="true">→</span>}
      </button>
      {state === "error" && errorMessage && (
        <p className="mt-2 text-xs text-destructive">
          {errorMessage.split("/start").map((part, i, arr) =>
            i < arr.length - 1 ? (
              <span key={i}>
                {part}
                <Link href="/start" className="underline">
                  /start
                </Link>
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </p>
      )}
    </div>
  );
}

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [capReached, setCapReached] = useState(false);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    panelX: number;
    panelY: number;
  } | null>(null);
  const resizeDragRef = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new TextStreamChatTransport({
      api: "/api/chat",
      body: {
        sessionId: typeof window !== "undefined" ? getSessionId() : "",
        pageUrl: typeof window !== "undefined" ? window.location.pathname : "",
      },
    }),
    onError: (err) => {
      const msg = err.message;
      if (msg.includes("monthly_cap_reached") || msg.includes("session_limit_reached")) {
        setCapReached(true);
        return;
      }
      if (msg.includes("rate_limited")) {
        setErrorReason("Too many messages — slow down for a few minutes.");
        return;
      }
      if (msg.includes("message_too_long")) {
        setErrorReason("That message is too long. Try a shorter version.");
        return;
      }
      setErrorReason("Something went wrong — try again.");
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open && status === "ready") {
      inputRef.current?.focus();
    }
  }, [status, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPosition(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Track latest open/messages state without re-triggering the nudge scheduler
  const openRef = useRef(open);
  const messageCountRef = useRef(messages.length);
  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { messageCountRef.current = messages.length; }, [messages.length]);

  // Schedule the proactive nudge on /pricing and /services pages
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onNudgePage = NUDGE_PATHS.some((p) => pathname?.startsWith(p));
    if (!onNudgePage) return;
    if (sessionStorage.getItem(NUDGE_KEY) === "1") return;

    let fired = false;
    const fire = () => {
      if (fired) return;
      if (openRef.current || messageCountRef.current > 0) return;
      fired = true;
      sessionStorage.setItem(NUDGE_KEY, "1");
      setNudgeVisible(true);
      cleanup();
    };

    const timeoutId = window.setTimeout(fire, NUDGE_DELAY_MS);

    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      if (window.scrollY / total > NUDGE_SCROLL_THRESHOLD) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let onMouseLeave: ((e: MouseEvent) => void) | null = null;
    if (window.matchMedia("(pointer: fine)").matches) {
      onMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) fire();
      };
      document.addEventListener("mouseleave", onMouseLeave);
    }

    function cleanup() {
      window.clearTimeout(timeoutId);
      window.removeEventListener("scroll", onScroll);
      if (onMouseLeave) document.removeEventListener("mouseleave", onMouseLeave);
    }

    return cleanup;
  }, [pathname]);

  // Clamp position and size when viewport shrinks so panel stays on screen
  useEffect(() => {
    if (!position && !size) return;
    const onResize = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const w = panel.offsetWidth;
      const h = panel.offsetHeight;
      if (position) {
        setPosition((prev) => {
          if (!prev) return prev;
          return {
            x: Math.max(8, Math.min(window.innerWidth - w - 8, prev.x)),
            y: Math.max(8, Math.min(window.innerHeight - h - 8, prev.y)),
          };
        });
      }
      if (size) {
        setSize((prev) => {
          if (!prev) return prev;
          return {
            width: Math.min(prev.width, MAX_PANEL_WIDTH, window.innerWidth - 48),
            height: Math.min(prev.height, MAX_PANEL_HEIGHT, window.innerHeight - 120),
          };
        });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [position, size]);

  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    resizeDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>, direction: "tl" | "br") => {
    if (!resizeDragRef.current) return;
    const { startX, startY, startW, startH } = resizeDragRef.current;
    let dW: number;
    let dH: number;
    if (direction === "tl") {
      // Top-left handle: moving left/up grows the panel (anchored bottom-right)
      dW = startX - e.clientX;
      dH = startY - e.clientY;
    } else {
      // Bottom-right handle: moving right/down grows the panel (anchored top-left)
      dW = e.clientX - startX;
      dH = e.clientY - startY;
    }
    const newW = Math.max(MIN_PANEL_WIDTH, Math.min(Math.min(MAX_PANEL_WIDTH, window.innerWidth - 48), startW + dW));
    const newH = Math.max(MIN_PANEL_HEIGHT, Math.min(Math.min(MAX_PANEL_HEIGHT, window.innerHeight - 120), startH + dH));
    setSize({ width: newW, height: newH });
  };

  const handleResizePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    resizeDragRef.current = null;
  };

  if (HIDDEN_PATHS.some((p) => pathname?.startsWith(p))) return null;

  const sessionLimitReached = messages.length >= MAX_SESSION_MESSAGES;

  const nudgeMessage = pathname?.startsWith("/pricing")
    ? "Have a question about pricing? I'll give you a real answer."
    : "Curious how this works? I can walk you through it in plain English.";

  const openChatFromNudge = () => {
    setNudgeVisible(false);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (input.length > MAX_MESSAGE_CHARS) return;
    sendMessage({ text: input });
    setInput("");
  };

  const overLimit = input.length > MAX_MESSAGE_CHARS;
  const showCounter = input.length > MESSAGE_WARN_CHARS;

  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Don't start drag when clicking on a link or button inside the header
    if ((e.target as HTMLElement).closest("button, a")) return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panelX: rect.left,
      panelY: rect.top,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const panel = panelRef.current;
    if (!panel) return;
    const { startX, startY, panelX, panelY } = dragRef.current;
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    const newX = Math.max(
      8,
      Math.min(window.innerWidth - w - 8, panelX + (e.clientX - startX))
    );
    const newY = Math.max(
      8,
      Math.min(window.innerHeight - h - 8, panelY + (e.clientY - startY))
    );
    setPosition({ x: newX, y: newY });
  };

  const handleHeaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
  };

  // Base panel class — size and position come from style when explicit size is set.
  const panelBase = "fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/40";
  let panelClassName: string;
  let panelStyle: React.CSSProperties | undefined;

  if (size) {
    panelClassName = panelBase;
    if (position) {
      panelStyle = { top: position.y, left: position.x, width: size.width, height: size.height };
    } else {
      // Anchored bottom-right; panel grows up/left as size increases.
      panelStyle = { right: 32, bottom: 96, width: size.width, height: size.height };
    }
  } else if (position) {
    panelClassName = `${panelBase} w-[min(calc(100vw-1.5rem),24rem)] max-h-[calc(100dvh-2rem)]`;
    panelStyle = { top: position.y, left: position.x };
  } else {
    // Default: full-width on mobile, max-w-sm anchored bottom-right on desktop.
    panelClassName = `${panelBase} inset-x-3 bottom-24 max-h-[calc(100dvh-7rem)] sm:inset-x-auto sm:right-8 sm:w-[calc(100vw-3rem)] sm:max-w-sm`;
    panelStyle = undefined;
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          ref={panelRef}
          className={panelClassName}
          style={panelStyle}
        >
          {/* Resize handle — top-left when anchored, bottom-right when dragged */}
          {!position && (
            <div
              aria-hidden="true"
              title="Drag to resize"
              onPointerDown={handleResizePointerDown}
              onPointerMove={(e) => handleResizePointerMove(e, "tl")}
              onPointerUp={handleResizePointerUp}
              onPointerCancel={handleResizePointerUp}
              className="absolute left-0 top-0 z-20 flex h-5 w-5 cursor-nw-resize touch-none items-start justify-start p-1"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="rotate-180 text-muted-foreground/30">
                <path d="M7 1L1 7M7 4L4 7M7 7L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}
          {position && (
            <div
              aria-hidden="true"
              title="Drag to resize"
              onPointerDown={handleResizePointerDown}
              onPointerMove={(e) => handleResizePointerMove(e, "br")}
              onPointerUp={handleResizePointerUp}
              onPointerCancel={handleResizePointerUp}
              className="absolute bottom-0 right-0 z-20 flex h-5 w-5 cursor-se-resize touch-none items-end justify-end p-1"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-muted-foreground/30">
                <path d="M7 1L1 7M7 4L4 7M7 7L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {/* Header — drag handle */}
          <div
            onPointerDown={handleHeaderPointerDown}
            onPointerMove={handleHeaderPointerMove}
            onPointerUp={handleHeaderPointerUp}
            onPointerCancel={handleHeaderPointerUp}
            className="flex cursor-grab select-none items-center justify-between gap-3 border-b border-border/60 px-4 py-3 active:cursor-grabbing"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="size-2 shrink-0 rounded-full bg-accent" />
              <span className="truncate text-sm font-medium">Stratus Assistant</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/start"
                className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                Talk to James →
              </Link>
              <button
                onClick={() => { setOpen(false); setPosition(null); }}
                aria-label="Close chat"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages — max-h cap only applies when no explicit size is set */}
          <div className={`flex min-h-[240px] flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-4${size ? "" : " sm:max-h-[360px]"}`}>
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ask me anything about pricing, services, or how we work. I&apos;ll give you a straight answer.
                </p>
                <div className="flex flex-col gap-1.5">
                  {[
                    "What does the Starter site include?",
                    "How much does an AI workflow cost?",
                    "How fast can you deliver?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => { sendMessage({ text: q }); }}
                      disabled={isLoading}
                      className="rounded-lg border border-border/60 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const text = getMessageText(m);
              if (!text) return null;

              if (m.role !== "assistant") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-foreground px-3.5 py-2.5 text-sm text-background break-words [overflow-wrap:anywhere]">
                      {text}
                    </div>
                  </div>
                );
              }

              const startUrl = buildStartUrl(messages);
              const { before: iqBefore, card, after: iqAfter } = parseInquiryCard(text);
              // If no inquiry card, check the full text for a start-cta
              const ctaSource = card ? "" : text;
              const { before, cta, after } = card
                ? { before: iqBefore, cta: null, after: iqAfter }
                : parseStartCta(ctaSource);
              return (
                <div key={m.id} className="flex flex-col items-start gap-2">
                  {before && (
                    <div className="max-w-[85%] rounded-2xl bg-card px-3.5 py-2.5 text-sm text-foreground break-words [overflow-wrap:anywhere]">
                      {renderMessageText(before, startUrl)}
                    </div>
                  )}
                  {card && (
                    <div className="w-full max-w-[85%]">
                      <InquiryCard data={card} />
                    </div>
                  )}
                  {cta && (
                    <div className="w-full max-w-[85%]">
                      <StartCtaCard data={cta} />
                    </div>
                  )}
                  {after && (
                    <div className="max-w-[85%] rounded-2xl bg-card px-3.5 py-2.5 text-sm text-foreground break-words [overflow-wrap:anywhere]">
                      {renderMessageText(after, startUrl)}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-card px-3.5 py-2.5">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border/60 p-3">
            {capReached || sessionLimitReached ? (
              <p className="text-center text-xs text-muted-foreground">
                Chat limit reached.{" "}
                <Link href="/start" className="text-foreground underline underline-offset-2">
                  Reach James directly →
                </Link>
              </p>
            ) : (
              <form
                id="chat-form"
                onSubmit={handleSubmit}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything…"
                  disabled={isLoading}
                  maxLength={MAX_MESSAGE_CHARS}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || overLimit}
                  aria-label="Send"
                  className="flex size-7 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            )}
            {showCounter && !capReached && !sessionLimitReached && (
              <p
                className={`mt-1.5 text-right font-mono text-[10px] tracking-widest ${
                  overLimit ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {input.length} / {MAX_MESSAGE_CHARS}
              </p>
            )}
            {error && !capReached && (
              <p className="mt-1.5 text-xs text-destructive">
                {errorReason ?? "Something went wrong — try again."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Proactive nudge */}
      {nudgeVisible && !open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300 sm:right-8">
          <div className="relative rounded-2xl border border-border bg-background p-4 shadow-2xl shadow-black/40">
            <button
              onClick={() => setNudgeVisible(false)}
              aria-label="Dismiss"
              className="absolute right-2 top-2 flex size-6 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-accent" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Stratus Assistant
              </p>
            </div>
            <p className="mt-2 pr-6 text-sm leading-relaxed text-foreground">
              {nudgeMessage}
            </p>
            <button
              onClick={openChatFromNudge}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent transition-opacity hover:opacity-80"
            >
              Ask a question →
            </button>
          </div>
        </div>
      )}

      {/* Toggle button + hover tooltip */}
      <div className="group fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
        {!open && (
          <div
            aria-hidden
            className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground opacity-0 shadow-lg shadow-black/30 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
          >
            How can I help?
          </div>
        )}
        <button
          onClick={() => {
            setOpen((v) => {
              if (v) setPosition(null);
              return !v;
            });
          }}
          aria-label={open ? "Close chat" : "Open chat"}
          className="flex size-13 cursor-pointer items-center justify-center rounded-full bg-foreground text-background shadow-lg shadow-black/30 transition-all hover:scale-105 hover:bg-accent hover:text-accent-foreground active:scale-95"
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 10C2 5.58 5.58 2 10 2s8 3.58 8 8-3.58 8-8 8a7.97 7.97 0 01-4-.27L2 18l.27-4A7.97 7.97 0 012 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
