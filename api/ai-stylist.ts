import { generateStylistAdvice, type StylistBenchmarkOptions } from '../src/server/stylistService.js';
import { jsonResponse, readJsonRequest } from '../src/server/serverlessHttp.js';

// Vercel file-based function: POST /api/ai-stylist
export async function POST(request: Request): Promise<Response> {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return jsonResponse({
      success: false,
      error: 'Chưa cấu hình GEMINI_API_KEY trong biến môi trường máy chủ.',
      errorCode: 'MISSING_API_KEY',
    }, 403);
  }

  const parsed = await readJsonRequest(request);
  if (!parsed.ok) return parsed.response;

  try {
    // Preview-only A/B timing, never enabled for production users.
    const requestedVariant = process.env.VERCEL_ENV === 'preview' ? request.headers.get('x-stylist-bench') : null;
    const variant = ['baseline', 'minimal', 'lite-first', 'fast-safe'].includes(requestedVariant ?? '') ? requestedVariant : null;
    const trace: NonNullable<StylistBenchmarkOptions['trace']> = [];
    const options: StylistBenchmarkOptions | undefined = variant ? { trace } : undefined;
    if (variant === 'minimal') options!.thinkingLevel = 'minimal';
    if (variant === 'lite-first') options!.candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    if (variant === 'fast-safe') { options!.thinkingLevel = 'minimal'; options!.timeoutMs = 12_000; }
    const started = performance.now();
    const result = await generateStylistAdvice(parsed.body, options);
    if (!variant) return jsonResponse(result);
    return Response.json(result, { headers: {
      'Cache-Control': 'no-store',
      'X-Bench-Duration-Ms': String(Math.round(performance.now() - started)),
      'X-Bench-Trace': JSON.stringify(trace),
      'X-Bench-Variant': variant,
    } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Server Error /api/ai-stylist]:', message);
    return jsonResponse({
      success: false,
      error: 'Đã xảy ra lỗi máy chủ nội bộ khi xử lý tư vấn phong cách.',
      errorCode: 'INTERNAL_SERVER_ERROR',
    }, 500);
  }
}
