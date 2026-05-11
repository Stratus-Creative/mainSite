import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createServerClient } from "@/lib/supabase";
import { getSystemPrompt } from "@/lib/chat-system-prompt";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { safePath, safeSessionId } from "@/lib/validate";
import { recordAiUsage } from "@/lib/ai-usage";
import { checkVoice } from "@/lib/voice-check";
import { emitEvent } from "@/lib/webhook-dispatch";

const CHAT_MODEL_ID = "claude-haiku-4-5-20251001";
const TONE_SAMPLE_RATE = 0.05;

export const maxDuration = 30;

const MONTHLY_MESSAGE_CAP = 5000;
const MAX_MESSAGE_CHARS = 2000;
const MAX_USER_MESSAGES_PER_CONVERSATION = 20;
const PER_IP_MAX = 30;
const PER_IP_WINDOW_MS = 10 * 60 * 1000;

function getTextLength(message: UIMessage): number {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .reduce((sum, p) => sum + p.text.length, 0);
}

function getText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const ipLimit = await checkRateLimit({
      bucket: `chat:${ip}`,
      max: PER_IP_MAX,
      windowMs: PER_IP_WINDOW_MS,
    });
    if (!ipLimit.allowed) {
      return Response.json({ error: "rate_limited" }, { status: 429 });
    }

    const body = await req.json() as {
      messages?: UIMessage[];
      sessionId?: string;
      pageUrl?: string;
    };

    const messages = body.messages;
    const sessionId = safeSessionId(body.sessionId);
    const pageUrl = safePath(body.pageUrl);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "invalid_messages" }, { status: 400 });
    }

    if (!sessionId) {
      return Response.json({ error: "invalid_session" }, { status: 400 });
    }

    for (const msg of messages) {
      if (msg.role === "user" && getTextLength(msg) > MAX_MESSAGE_CHARS) {
        return Response.json({ error: "message_too_long" }, { status: 400 });
      }
    }

    const supabase = createServerClient();

    // Monthly global cap
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count: monthlyCount } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart.toISOString());

    if (monthlyCount !== null && monthlyCount >= MONTHLY_MESSAGE_CAP) {
      return Response.json({ error: "monthly_cap_reached" }, { status: 429 });
    }

    // Conversation lookup or create — race-safe via unique constraint on session_id
    let conversationId: string | null = null;
    let dbHealthy = true;

    const { data: existing, error: existingError } = await supabase
      .from("conversations")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (existingError) {
      console.error("Conversation lookup failed:", existingError.message);
      dbHealthy = false;
    } else if (existing) {
      conversationId = existing.id;
    } else {
      const { data: created, error: insertError } = await supabase
        .from("conversations")
        .insert({ session_id: sessionId, page_url: pageUrl })
        .select("id")
        .single();

      if (insertError) {
        // Could be a race-condition unique-violation — try to read again.
        const { data: retry } = await supabase
          .from("conversations")
          .select("id")
          .eq("session_id", sessionId)
          .maybeSingle();
        if (retry) {
          conversationId = retry.id;
        } else {
          console.error("Conversation insert failed:", insertError.message);
          dbHealthy = false;
        }
      } else if (created) {
        conversationId = created.id;
      }
    }

    // Server-enforced per-conversation user-message cap
    if (conversationId) {
      const { count: userMsgCount } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .eq("role", "user");

      if (
        userMsgCount !== null &&
        userMsgCount >= MAX_USER_MESSAGES_PER_CONVERSATION
      ) {
        return Response.json({ error: "session_limit_reached" }, { status: 429 });
      }
    }

    // Log incoming user message (best-effort — don't block on DB failure)
    if (conversationId) {
      const lastMessage = messages[messages.length - 1];
      const userText = getText(lastMessage);
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: userText,
      });
      if (msgError) {
        console.error("Message insert failed:", msgError.message);
        dbHealthy = false;
      }
    }

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: anthropic(CHAT_MODEL_ID),
      system: await getSystemPrompt(pageUrl),
      messages: modelMessages,
      maxOutputTokens: 220,
      onFinish: async ({ text, usage }) => {
        void recordAiUsage(
          "chat_widget",
          CHAT_MODEL_ID,
          usage?.inputTokens ?? 0,
          usage?.outputTokens ?? 0,
          conversationId ? { conversation_id: conversationId } : undefined
        );

        if (!conversationId || !dbHealthy) return;
        try {
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: text,
          });

          // Auto-flag conversations where the bot fell back to "I don't know".
          if (
            text.trim().startsWith(
              "I don't have a documented answer for that."
            )
          ) {
            try {
              await supabase
                .from("conversations")
                .update({ flagged: true })
                .eq("id", conversationId);
            } catch (flagErr) {
              console.error("Auto-flag failed:", flagErr);
            }
          }
        } catch (err) {
          console.error("Assistant message insert failed:", err);
        }

        // Sampled tone monitoring — runs after the response is sent so latency
        // doesn't matter to the user. Only fires on a fraction of replies to
        // keep eval costs bounded.
        if (Math.random() < TONE_SAMPLE_RATE && text.trim().length > 0) {
          try {
            const result = await checkVoice(text);
            if (result.issues.length > 0) {
              await emitEvent(null, "bot.tone_issue", {
                conversationId,
                score: result.score,
                issues: result.issues,
                content_preview: text.slice(0, 200),
              });
            }
          } catch (toneErr) {
            console.error("[chat] tone check failed:", toneErr);
          }
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[/api/chat]", err);
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
