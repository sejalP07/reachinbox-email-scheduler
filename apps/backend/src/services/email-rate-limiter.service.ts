import { redis } from "../config/redis.js";

interface RateLimitResult {
  allowed: boolean;
  retryAt: number;
  count: number;
  windowEnd: number;
}

const DEFAULT_MIN_EMAIL_DELAY_MS = Number(
  process.env.MIN_EMAIL_DELAY_MS ?? 2000,
);

const DEFAULT_MAX_EMAILS_PER_HOUR = Number(
  process.env.MAX_EMAILS_PER_HOUR_PER_SENDER ?? 200,
);

/*
 * Atomically:
 *
 * 1. Check hourly sender limit.
 * 2. Check minimum delay between sends.
 * 3. Increment hourly counter when allowed.
 * 4. Reserve the next send slot.
 *
 * Redis Lua guarantees atomic execution across
 * multiple workers / backend instances.
 */
const RESERVE_SEND_SCRIPT = `
local hourlyKey = KEYS[1]
local nextSendKey = KEYS[2]

local now = tonumber(ARGV[1])
local minDelay = tonumber(ARGV[2])
local maxPerHour = tonumber(ARGV[3])
local windowEndMs = tonumber(ARGV[4])
local windowEndSeconds = tonumber(ARGV[5])

local count =
  tonumber(redis.call("GET", hourlyKey) or "0")

local nextSend =
  tonumber(redis.call("GET", nextSendKey) or "0")

-- Hourly limit reached
if count >= maxPerHour then
  return {
    0,
    windowEndMs,
    count
  }
end

-- Minimum delay has not elapsed
if nextSend > now then
  return {
    0,
    nextSend,
    count
  }
end

-- Reserve this send
local newCount = count + 1

redis.call(
  "SET",
  hourlyKey,
  newCount,
  "EXAT",
  windowEndSeconds
)

-- Reserve next send slot
local nextAvailable =
  now + minDelay

redis.call(
  "SET",
  nextSendKey,
  nextAvailable,
  "PX",
  math.max(minDelay * 2, 60000)
)

return {
  1,
  nextAvailable,
  newCount
}
`;

function getCurrentHourWindow() {
  const now = Date.now();

  const hourStart =
    Math.floor(now / 3_600_000) *
    3_600_000;

  const windowEnd =
    hourStart + 3_600_000;

  return {
    now,
    hourStart,
    windowEnd,
  };
}

export async function reserveSendSlot(
  senderId: string,
  minDelayMs = DEFAULT_MIN_EMAIL_DELAY_MS,
  maxEmailsPerHour = DEFAULT_MAX_EMAILS_PER_HOUR,
): Promise<RateLimitResult> {
  const {
    now,
    hourStart,
    windowEnd,
  } = getCurrentHourWindow();

  const hourlyKey =
    `email-rate:${senderId}:${hourStart}`;

  const nextSendKey =
    `email-next-send:${senderId}`;

  const result = (await redis.eval(
    RESERVE_SEND_SCRIPT,
    2,
    hourlyKey,
    nextSendKey,
    now,
    minDelayMs,
    maxEmailsPerHour,
    windowEnd,
    Math.floor(windowEnd / 1000),
    )) as [number, number, number];
  const [
    allowed,
    retryAt,
    count,
  ] = result;

  return {
    allowed: allowed === 1,
    retryAt,
    count,
    windowEnd,
  };
}