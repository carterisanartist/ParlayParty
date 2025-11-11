import { z } from 'zod';

// Input validation schemas
export const playerJoinSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(20, 'Name must be 20 characters or less')
    .regex(/^[a-zA-Z0-9\s._-]+$/, 'Name contains invalid characters'),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export const parlaySubmitSchema = z.object({
  text: z.string()
    .trim()
    .min(1, 'Parlay text is required')
    .max(200, 'Parlay text must be 200 characters or less'),
  punishment: z.string()
    .trim()
    .max(50, 'Punishment must be 50 characters or less')
    .optional(),
  frequency: z.enum(['once', 'multiple']).default('once'),
});

export const videoAddSchema = z.object({
  videoType: z.enum(['youtube', 'tiktok', 'upload']),
  videoUrl: z.string().url().optional(),
  videoId: z.string().max(100).optional(),
  title: z.string().max(200).optional(),
});

export const voteAddSchema = z.object({
  tVideoSec: z.number().min(0).max(86400), // Max 24 hours
  normalizedText: z.string().trim().min(1).max(200),
  parlayText: z.string().trim().min(1).max(200),
});

// Validation middleware
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Rate limiting - simple in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(socketId: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(socketId);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(socketId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Cleanup expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 300000); // Cleanup every 5 minutes
