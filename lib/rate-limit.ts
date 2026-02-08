import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const inMemoryWindow = new Map<string, { count: number; resetAt: number }>();

const useUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const ratelimit = useUpstash
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL ?? "",
        token: process.env.UPSTASH_REDIS_REST_TOKEN ?? ""
      }),
      limiter: Ratelimit.slidingWindow(10, "1 m")
    })
  : null;

export async function rateLimit(identifier: string) {
  if (ratelimit) {
    const result = await ratelimit.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining
    };
  }

  const now = Date.now();
  const entry = inMemoryWindow.get(identifier);
  if (!entry || entry.resetAt < now) {
    inMemoryWindow.set(identifier, { count: 1, resetAt: now + 60_000 });
    return { success: true, remaining: 9 };
  }

  if (entry.count >= 10) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  inMemoryWindow.set(identifier, entry);
  return { success: true, remaining: 10 - entry.count };
}
