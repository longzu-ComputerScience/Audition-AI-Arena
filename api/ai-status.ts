// Presence check only: model validity and quota require a real Gemini request.
export function GET(): Response {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY?.trim());

  return Response.json({
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
  }, { headers: { 'Cache-Control': 'no-store' } });
}

// Explicit Vercel Fetch handler: Vite is not a Next.js App Router project.
export default {
  fetch(request: Request): Response | Promise<Response> {
    if (request.method !== 'GET') {
      return Response.json({ success: false, error: 'Method Not Allowed', errorCode: 'METHOD_NOT_ALLOWED' }, { status: 405 });
    }
    return GET();
  },
};
