import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import {
  COLORS,
  FONTS,
  STUDIO_EMAIL,
  STUDIO_NAME,
  SITE_URL,
} from "./_theme";

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: COLORS.bg,
          margin: 0,
          padding: 0,
          fontFamily: FONTS.sans,
          color: COLORS.fg,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            margin: "0 auto",
            padding: "48px 24px 56px",
          }}
        >
          {/* Wordmark */}
          <Section style={{ paddingBottom: 32 }}>
            <Text
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: COLORS.fg,
                margin: 0,
                fontWeight: 500,
              }}
            >
              <Link
                href={SITE_URL}
                style={{ color: COLORS.fg, textDecoration: "none" }}
              >
                Stratus / Creative
              </Link>
            </Text>
          </Section>

          <Hr
            style={{
              border: "none",
              borderTop: `1px solid ${COLORS.border}`,
              margin: 0,
            }}
          />

          {/* Body */}
          <Section style={{ padding: "40px 0 48px" }}>{children}</Section>

          <Hr
            style={{
              border: "none",
              borderTop: `1px solid ${COLORS.border}`,
              margin: 0,
            }}
          />

          {/* Footer */}
          <Section style={{ paddingTop: 28 }}>
            <Text
              style={{
                fontFamily: FONTS.mono,
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: COLORS.subtle,
                margin: "0 0 10px 0",
                fontWeight: 500,
              }}
            >
              {STUDIO_NAME}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: COLORS.muted,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              <Link
                href={`mailto:${STUDIO_EMAIL}`}
                style={{ color: COLORS.muted, textDecoration: "underline" }}
              >
                {STUDIO_EMAIL}
              </Link>
              {" · "}
              <Link
                href={SITE_URL}
                style={{ color: COLORS.muted, textDecoration: "underline" }}
              >
                stratus-creative.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Shared content primitives ────────────────────────────────────────────────

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: FONTS.mono,
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: COLORS.accent,
        margin: "0 0 20px 0",
        fontWeight: 500,
      }}
    >
      {children}
    </Text>
  );
}

export function Headline({
  children,
  serif = false,
}: {
  children: ReactNode;
  serif?: boolean;
}) {
  return (
    <Text
      style={{
        fontFamily: serif ? FONTS.serif : FONTS.sans,
        fontSize: serif ? 38 : 26,
        lineHeight: serif ? 1.05 : 1.2,
        letterSpacing: serif ? "-0.015em" : "-0.02em",
        color: COLORS.fg,
        margin: "0 0 24px 0",
        fontWeight: serif ? 400 : 600,
      }}
    >
      {children}
    </Text>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 16,
        lineHeight: 1.65,
        color: COLORS.fg,
        margin: "0 0 18px 0",
      }}
    >
      {children}
    </Text>
  );
}

export function MutedParagraph({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 14,
        lineHeight: 1.65,
        color: COLORS.muted,
        margin: "0 0 18px 0",
      }}
    >
      {children}
    </Text>
  );
}

export function CtaButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Section style={{ padding: "12px 0 28px" }}>
      <Link
        href={href}
        style={{
          display: "inline-block",
          backgroundColor: COLORS.fg,
          color: "#FFFFFF",
          textDecoration: "none",
          padding: "14px 28px",
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "0.01em",
        }}
      >
        {children}{" "}
        <span style={{ display: "inline-block", marginLeft: 6 }}>→</span>
      </Link>
    </Section>
  );
}

export function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Text style={{ margin: "0 0 18px 0" }}>
      <Link
        href={href}
        style={{
          color: COLORS.fg,
          fontSize: 14,
          textDecoration: "underline",
          textUnderlineOffset: 3,
          fontWeight: 500,
        }}
      >
        {children} →
      </Link>
    </Text>
  );
}

export function DetailCard({ children }: { children: ReactNode }) {
  return (
    <Section
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: "24px 26px",
        margin: "8px 0 28px",
      }}
    >
      {children}
    </Section>
  );
}

export function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <Text
      style={{
        margin: "0 0 14px 0",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: COLORS.muted,
          display: "block",
          marginBottom: 4,
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span style={{ color: COLORS.fg, fontSize: 15 }}>{value}</span>
    </Text>
  );
}

export function StatBlock({
  label,
  value,
  serif = true,
}: {
  label: string;
  value: ReactNode;
  serif?: boolean;
}) {
  return (
    <Section style={{ padding: "8px 0 24px" }}>
      <Text
        style={{
          fontFamily: FONTS.mono,
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: COLORS.accent,
          margin: "0 0 8px 0",
          fontWeight: 500,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: serif ? FONTS.serif : FONTS.sans,
          fontSize: serif ? 44 : 32,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: COLORS.fg,
          margin: 0,
          fontWeight: serif ? 400 : 600,
        }}
      >
        {value}
      </Text>
    </Section>
  );
}

export function Signoff({ name = "Stratus Creative" }: { name?: string }) {
  return (
    <Text
      style={{
        fontSize: 16,
        lineHeight: 1.5,
        color: COLORS.fg,
        margin: "32px 0 0 0",
      }}
    >
      — {name}
    </Text>
  );
}
