/**
 * Small HTTP helpers for Vercel's standard Web Request/Response runtime.
 * Keep the local Express server unchanged; these only adapt its API contract.
 */
const MAX_JSON_REQUEST_BYTES = 1024 * 1024; // Match server.ts express.json({ limit: '1mb' })

export function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function readJsonRequest(
  request: Request
): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return {
      ok: false,
      response: jsonResponse({ success: false, error: 'Yêu cầu phải sử dụng Content-Type: application/json.', errorCode: 'UNSUPPORTED_MEDIA_TYPE' }, 415),
    };
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength !== null && Number(contentLength) > MAX_JSON_REQUEST_BYTES) {
    return {
      ok: false,
      response: jsonResponse({ success: false, error: 'Dữ liệu yêu cầu vượt quá giới hạn 1 MB.', errorCode: 'PAYLOAD_TOO_LARGE' }, 413),
    };
  }

  try {
    const text = await request.text();
    if (Buffer.byteLength(text, 'utf8') > MAX_JSON_REQUEST_BYTES) {
      return {
        ok: false,
        response: jsonResponse({ success: false, error: 'Dữ liệu yêu cầu vượt quá giới hạn 1 MB.', errorCode: 'PAYLOAD_TOO_LARGE' }, 413),
      };
    }
    return { ok: true, body: JSON.parse(text) as unknown };
  } catch {
    return {
      ok: false,
      response: jsonResponse({ success: false, error: 'Dữ liệu JSON không hợp lệ.', errorCode: 'INVALID_JSON' }, 400),
    };
  }
}
