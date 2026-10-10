// Vercel file-based function: GET /api/health
export function GET(): Response {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY?.trim());
  return Response.json({
    status: 'ok',
    isAvailable: hasApiKey,
    hasApiKey,
    timestamp: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store' } });
}

// Explicit Fetch entry point for Vite's file-based Vercel Function adapter.
// Keep the named GET export for compatibility and unit tests.
export default {
  fetch(request: Request): Response {
    if (request.method !== 'GET') {
      return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
    }
    return GET();
  },
};
