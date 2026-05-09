import { generateSecret, generateURI, verify } from "otplib";
import { randomBytes } from "crypto";
import QRCode from "qrcode";

export type TotpSetup = {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
  recoveryCodes: string[];
};

const ISSUER = "Stratus Admin";

export function generateRecoveryCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = randomBytes(5).toString("hex").toUpperCase();
    codes.push(`${raw.slice(0, 5)}-${raw.slice(5, 10)}`);
  }
  return codes;
}

export async function buildTotpSetup(accountEmail: string): Promise<TotpSetup> {
  const secret = generateSecret({ length: 20 });
  const otpauthUrl = generateURI({
    strategy: "totp",
    issuer: ISSUER,
    label: accountEmail,
    secret,
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
    margin: 1,
    width: 240,
  });
  const recoveryCodes = generateRecoveryCodes();
  return { secret, otpauthUrl, qrCodeDataUrl, recoveryCodes };
}

export async function verifyTotp(secret: string, token: string): Promise<boolean> {
  if (!secret || !token) return false;
  const cleaned = token.replace(/\s+/g, "").trim();
  try {
    const result = (await verify({
      strategy: "totp",
      secret,
      token: cleaned,
      // Allow a 1-period (~30s) drift before/after.
      epochTolerance: [1, 1],
    })) as { valid?: boolean; isValid?: boolean } | null;
    return Boolean(result?.valid ?? result?.isValid);
  } catch {
    return false;
  }
}
