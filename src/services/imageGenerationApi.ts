export interface GenerateOutfitImageParams {
  coreId: string;
  bottomId: string;
  shoesId: string;
  bagId: string;
  accentId?: string | null;
  occasion?: string;
  location?: string;
  style?: string;
  preferredColor?: string;
}

export interface GenerateOutfitImageResult {
  success: boolean;
  imageUrl?: string;
  prompt?: string;
  model?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Sends a structured styling snapshot to the server endpoint to generate an editorial portrait image.
 */
export async function requestOutfitEditorialImage(
  params: GenerateOutfitImageParams
): Promise<GenerateOutfitImageResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 75000); // 75s timeout for image models

  try {
    const response = await fetch('/api/generate-outfit-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error:
          errorData?.error ||
          `Máy chủ trả về mã lỗi HTTP ${response.status}. Vui lòng thử lại.`,
        errorCode: errorData?.errorCode || `HTTP_${response.status}`,
      };
    }

    const data: GenerateOutfitImageResult = await response.json();
    return data;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        success: false,
        error:
          'Yêu cầu tạo ảnh quá thời gian chờ (hơn 75 giây). Vui lòng kiểm tra kết nối mạng và thử lại.',
        errorCode: 'TIMEOUT',
      };
    }

    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Không thể kết nối đến máy chủ: ${message}`,
      errorCode: 'NETWORK_ERROR',
    };
  }
}
