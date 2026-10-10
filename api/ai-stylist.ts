import { generateStylistAdvice } from '../src/server/stylistService.js';
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
    const result = await generateStylistAdvice(parsed.body);
    return jsonResponse(result);
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
