import { jsonResponse } from '../src/server/serverlessHttp';

// Presence check only: model validity and quota require a real Gemini request.
export function GET(): Response {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY?.trim());

  return jsonResponse({
    isAvailable: hasApiKey,
    hasApiKey,
    models: {
      stylist: 'gemini-3.8-flash',
      image: 'gemini-3.1-flash-lite-image',
    },
    message: hasApiKey
      ? 'Hệ thống Trí tuệ nhân tạo Gemini sẵn sàng hỗ trợ bạn.'
      : 'Chưa cấu hình GEMINI_API_KEY trong biến môi trường máy chủ. Các tính năng AI đang ở chế độ xem trước tĩnh.',
    timestamp: new Date().toISOString(),
  });
}
