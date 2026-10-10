import { AIStatusInfo, StylistAdviceResult, SupportCategoryId } from '../types';

export interface RequestStylistParams {
  coreId: string;
  bottomId: string;
  shoesId: string;
  bagId: string;
  accentId?: string | null;
  occasion?: string;
  location?: string;
  style?: string;
  preferredColor?: string;
  targetRemix?: number;
  actualRemix?: number;
  userQuery?: string;
  consultationType?: 'general' | 'occasion' | 'color' | 'remix' | 'custom';
}

let cachedAIStatus: AIStatusInfo | null = null;
let lastStatusFetchTime = 0;

/**
 * Fetches the shared AI availability status from the server.
 * Caches for 10 seconds to avoid spamming the status endpoint.
 */
export async function fetchAIStatus(forceRefresh = false): Promise<AIStatusInfo> {
  const now = Date.now();
  if (!forceRefresh && cachedAIStatus && now - lastStatusFetchTime < 10000) {
    return cachedAIStatus;
  }

  try {
    const res = await fetch('/api/ai-status', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const fallback: AIStatusInfo = {
        isAvailable: false,
        hasApiKey: false,
        loading: false,
        message: `Máy chủ trả về trạng thái HTTP ${res.status}.`,
      };
      cachedAIStatus = fallback;
      lastStatusFetchTime = now;
      return fallback;
    }

    const data = await res.json();
    const statusResult: AIStatusInfo = {
      isAvailable: Boolean(data.isAvailable && data.hasApiKey),
      hasApiKey: Boolean(data.hasApiKey),
      loading: false,
      models: data.models,
      message: data.message,
    };

    cachedAIStatus = statusResult;
    lastStatusFetchTime = now;
    return statusResult;
  } catch (err) {
    console.warn('[AI Stylist API] Failed to fetch AI status:', err);
    const fallback: AIStatusInfo = {
      isAvailable: false,
      hasApiKey: false,
      loading: false,
      message: 'Không thể kết nối với dịch vụ kiểm tra trạng thái AI.',
    };
    cachedAIStatus = fallback;
    lastStatusFetchTime = now;
    return fallback;
  }
}

/**
 * Calls the AI Stylist endpoint with current styling snapshot and user query.
 */
export async function requestStylistAdvice(
  params: RequestStylistParams
): Promise<StylistAdviceResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

  // Opt-in Preview experiment only. Normal and Production calls retain default behavior.
  const stylistBenchmark = new URLSearchParams(window.location.search).get('stylist_bench');
  const benchmarkHeaders: Record<string, string> =
    stylistBenchmark === 'balanced2' || stylistBenchmark === 'baseline'
      ? { 'X-Stylist-Bench': stylistBenchmark }
      : {};

  try {
    const response = await fetch('/api/ai-stylist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...benchmarkHeaders,
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      return {
        success: false,
        review: '',
        recommendations: [],
        error:
          errData?.error ||
          `Máy chủ trả về mã lỗi HTTP ${response.status}. Vui lòng thử lại.`,
        errorCode: errData?.errorCode || `HTTP_${response.status}`,
      };
    }

    const data: StylistAdviceResult = await response.json();
    return data;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        success: false,
        review: '',
        recommendations: [],
        error: 'Yêu cầu tư vấn phong cách AI quá thời gian chờ (35 giây). Vui lòng thử lại.',
        errorCode: 'TIMEOUT',
      };
    }

    return {
      success: false,
      review: '',
      recommendations: [],
      error:
        err instanceof Error
          ? err.message
          : 'Không thể kết nối đến máy chủ AI Stylist.',
      errorCode: 'NETWORK_ERROR',
    };
  }
}
