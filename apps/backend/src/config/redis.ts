import RedisModule from "ioredis";

const Redis = RedisModule.default ?? RedisModule;

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined");
}

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (error: Error) => {
  console.error("❌ Redis error:", error);
});