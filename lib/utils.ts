import crypto from "crypto";

export function hashText(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function getBaseUrl() {
  return process.env.APP_BASE_URL || "http://localhost:3000";
}
