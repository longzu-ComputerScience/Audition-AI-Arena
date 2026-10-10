import { jsonResponse } from '../src/server/serverlessHttp';

// Vercel file-based function: GET /api/health
export function GET(): Response {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY?.trim());
  return jsonResponse({
    status: 'ok',
    isAvailable: hasApiKey,
    hasApiKey,
    timestamp: new Date().toISOString(),
  });
}
