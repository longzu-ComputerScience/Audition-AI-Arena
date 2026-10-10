import { validateAndResolveOutfit } from '../src/server/promptBuilder';
import { generateOutfitEditorialImage } from '../src/server/imageService';
import { jsonResponse, readJsonRequest } from '../src/server/serverlessHttp';

// Leave space below Vercel's 4.5 MB maximum response payload.
const MAX_JSON_RESPONSE_BYTES = 4_000_000;

// Vercel file-based function: POST /api/generate-outfit-image
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
    const validation = validateAndResolveOutfit(parsed.body);
    if (!validation.valid) {
      return jsonResponse({
        success: false,
        error: validation.error,
        errorCode: 'INVALID_REQUEST',
      }, 400);
    }

    const result = await generateOutfitEditorialImage(validation.data);
    const body = JSON.stringify(result);

    if (Buffer.byteLength(body, 'utf8') > MAX_JSON_RESPONSE_BYTES) {
      return jsonResponse({
        success: false,
        error: 'Ảnh AI đã được tạo nhưng dữ liệu vượt giới hạn phản hồi của Vercel. Vui lòng thử lại; ảnh lớn cần cơ chế lưu trữ và trả URL riêng.',
        errorCode: 'IMAGE_RESPONSE_TOO_LARGE',
      }, 502);
    }

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Server Error /api/generate-outfit-image]:', message);
    return jsonResponse({
      success: false,
      error: 'Đã xảy ra lỗi máy chủ nội bộ khi xử lý tạo ảnh.',
      errorCode: 'INTERNAL_SERVER_ERROR',
    }, 500);
  }
}
