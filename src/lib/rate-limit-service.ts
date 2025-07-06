import { createClient } from '@supabase/supabase-js';

// Fallback to in-memory store if Redis is not available
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

// Supabase client for Redis-like functionality using PostgreSQL
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  identifier: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check rate limit using PostgreSQL as a distributed store
 */
export async function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): Promise<RateLimitResult> {
  const now = Date.now();
  const resetTime = now + windowMs;
  
  try {
    // Try to use PostgreSQL for distributed rate limiting
    const { data, error } = await supabase
      .rpc('check_rate_limit', {
        p_identifier: identifier,
        p_max_attempts: maxAttempts,
        p_window_ms: windowMs,
        p_current_time: new Date(now).toISOString()
      });

    if (error) {
      console.warn('PostgreSQL rate limiting failed, falling back to in-memory:', error);
      return checkRateLimitInMemory(identifier, maxAttempts, windowMs);
    }

    return {
      success: data.success,
      remaining: data.remaining,
      resetTime: data.reset_time,
      retryAfter: data.retry_after
    };
  } catch (error) {
    console.warn('Rate limiting error, falling back to in-memory:', error);
    return checkRateLimitInMemory(identifier, maxAttempts, windowMs);
  }
}

/**
 * Fallback in-memory rate limiting
 */
function checkRateLimitInMemory(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = inMemoryStore.get(identifier);

  if (!record || now > record.resetTime) {
    inMemoryStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      remaining: maxAttempts - 1,
      resetTime: now + windowMs
    };
  }

  if (record.count >= maxAttempts) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    };
  }

  record.count++;
  return {
    success: true,
    remaining: maxAttempts - record.count,
    resetTime: record.resetTime
  };
}

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  try {
    await supabase
      .rpc('reset_rate_limit', {
        p_identifier: identifier
      });
  } catch (error) {
    console.warn('Failed to reset rate limit in PostgreSQL:', error);
    // Fallback to in-memory
    inMemoryStore.delete(identifier);
  }
}

/**
 * Get rate limit info for an identifier
 */
export async function getRateLimitInfo(identifier: string): Promise<{
  count: number;
  remaining: number;
  resetTime: number;
} | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_rate_limit_info', {
        p_identifier: identifier
      });

    if (error) {
      console.warn('Failed to get rate limit info from PostgreSQL:', error);
      return getRateLimitInfoInMemory(identifier);
    }

    return data;
  } catch (error) {
    console.warn('Error getting rate limit info, falling back to in-memory:', error);
    return getRateLimitInfoInMemory(identifier);
  }
}

/**
 * Fallback in-memory rate limit info
 */
function getRateLimitInfoInMemory(identifier: string): {
  count: number;
  remaining: number;
  resetTime: number;
} | null {
  const record = inMemoryStore.get(identifier);
  if (!record) return null;

  const now = Date.now();
  if (now > record.resetTime) {
    inMemoryStore.delete(identifier);
    return null;
  }

  return {
    count: record.count,
    remaining: Math.max(0, 5 - record.count), // Assuming default maxAttempts of 5
    resetTime: record.resetTime
  };
}

/**
 * Clean up expired rate limit records
 */
export async function cleanupExpiredRateLimits(): Promise<void> {
  try {
    await supabase
      .rpc('cleanup_expired_rate_limits');
  } catch (error) {
    console.warn('Failed to cleanup expired rate limits:', error);
    // Fallback to in-memory cleanup
    cleanupExpiredRateLimitsInMemory();
  }
}

/**
 * Fallback in-memory cleanup
 */
function cleanupExpiredRateLimitsInMemory(): void {
  const now = Date.now();
  for (const [identifier, record] of inMemoryStore.entries()) {
    if (now > record.resetTime) {
      inMemoryStore.delete(identifier);
    }
  }
}

/**
 * Rate limiting middleware for API routes
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async function rateLimitMiddleware(request: Request): Promise<Response | null> {
    const identifier = config.identifier;
    const result = await checkRateLimit(identifier, config.maxAttempts, config.windowMs);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxAttempts.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            'Retry-After': result.retryAfter?.toString() || '60'
          }
        }
      );
    }

    return null; // Continue with the request
  };
}

/**
 * Specific rate limit configurations
 */
export const RATE_LIMITS = {
  SIGNUP: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  LOGIN: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  EMAIL_VERIFICATION: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  API_GENERAL: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
  }
} as const; 