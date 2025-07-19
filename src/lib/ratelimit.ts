import type { NextApiRequest, NextApiResponse } from "next";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Extract IP address from request
export const getIp = (req: NextApiRequest): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    // x-forwarded-for may return multiple IP addresses in the format: "client IP, proxy 1 IP, proxy 2 IP"
    // Therefore, the right-most IP address is the IP address of the most recent proxy
    // and the left-most IP address is the IP address of the originating client.
    // We take the first one (originating client).
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
};

// Create rate limiter with configurable limits
export const createRateLimiter = (maxRequests: number, durationInSeconds: number = 3600) => {
  return new RateLimiterMemory({
    points: maxRequests,
    duration: durationInSeconds,
  });
};

// Apply rate limiting to a request
export const applyRateLimit = async (
  req: NextApiRequest,
  res: NextApiResponse,
  rateLimiter: RateLimiterMemory
): Promise<boolean> => {
  const ip = getIp(req);
  
  try {
    await rateLimiter.consume(ip);
    return true; // Rate limit passed
  } catch (rateLimiterRes) {
    let retrySeconds = 1;
    if (
      typeof rateLimiterRes === "object" &&
      rateLimiterRes !== null &&
      "msBeforeNext" in rateLimiterRes &&
      typeof rateLimiterRes.msBeforeNext === "number"
    ) {
      retrySeconds = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
    }
    
    res.setHeader("Retry-After", String(retrySeconds));
    res.status(429).json({ 
      success: false, 
      message: "Trop de tentatives. Veuillez réessayer plus tard." 
    });
    
    return false; // Rate limit failed
  }
};
