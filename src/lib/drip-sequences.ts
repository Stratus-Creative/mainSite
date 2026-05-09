// Drip sequence definitions. The `body` function receives a sub object so we
// can interpolate names. Tone: direct, no exclamation points, no "Great
// question!" — match the rest of Stratus's outbound voice.

type SubLite = {
  owner_name?: string | null;
  business_name?: string | null;
  project_type?: string | null;
};

export type DripStep = {
  delayDays: number;
  subject: string;
  body: (sub: SubLite) => string;
};

function nameOrFallback(sub: SubLite): string {
  return sub.owner_name?.trim() || "there";
}

export const SEQUENCES: Record<string, DripStep[]> = {
  "no-reply-followup": [
    {
      delayDays: 3,
      subject: "Following up",
      body: (sub) =>
        `Hi ${nameOrFallback(sub)},\n\nChecking in on the inquiry you sent over. Happy to answer questions, walk through scope, or set up a 15-minute call — whichever is easiest.\n\nReply when you have a moment.\n\n— James\nStratus Creative`,
    },
    {
      delayDays: 7,
      subject: "One more nudge",
      body: (sub) =>
        `Hi ${nameOrFallback(sub)},\n\nNot trying to pile on. If timing has shifted or the project is on hold, just say so and I'll close it out cleanly.\n\nIf it's still live, send back what you're thinking and I'll move it forward.\n\n— James`,
    },
    {
      delayDays: 14,
      subject: "Closing this out unless I hear back",
      body: (sub) =>
        `Hi ${nameOrFallback(sub)},\n\nGoing to close this inquiry on our end so it stops cluttering both our inboxes. Reopening is one reply away — no awkwardness if you come back in a few weeks or months.\n\n— James\nStratus Creative`,
    },
  ],
  "post-quote-followup": [
    {
      delayDays: 5,
      subject: "Did you have any questions about the quote?",
      body: (sub) =>
        `Hi ${nameOrFallback(sub)},\n\nWanted to check whether the quote made sense and whether anything in the scope needs adjusting. Common edits are timeline, payment split, or trimming a feature.\n\nLet me know what you're thinking.\n\n— James`,
    },
    {
      delayDays: 14,
      subject: "Still interested?",
      body: (sub) =>
        `Hi ${nameOrFallback(sub)},\n\nQuick check-in on the quote I sent. If the answer is "not right now," that's useful to know — I can hold the slot or release it.\n\nReply with a yes, no, or a question.\n\n— James`,
    },
  ],
};

export type SequenceType = keyof typeof SEQUENCES;

export function isValidSequenceType(s: string): s is SequenceType {
  return Object.prototype.hasOwnProperty.call(SEQUENCES, s);
}
