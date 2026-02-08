import crypto from "crypto";

const COOKIE_NAME = "hireboost_session";

export function getCookieName() {
  return COOKIE_NAME;
}

function getSecret() {
  return process.env.AUTH_COOKIE_SECRET || "dev-secret-change-me";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf-8");
}

export function signSession(payload: { email: string; exp: number }) {
  const data = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySession(token?: string | null) {
  if (!token) {
    return null;
  }
  const [data, signature] = token.split(".");
  if (!data || !signature) {
    return null;
  }
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  const payload = JSON.parse(base64UrlDecode(data)) as { email: string; exp: number };
  if (payload.exp < Date.now()) {
    return null;
  }
  return payload;
}
