import { GoogleGenAI } from '@google/genai';
import {
  ValidatedOutfitSelection,
  buildFashionEditorialPrompt,
} from './promptBuilder.js';

export interface GenerateImageResult {
  success: boolean;
  imageUrl?: string;
  mimeType?: string;
  prompt?: string;
  model?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Executes a real text-to-image request with Google GenAI SDK.
 */
export async function generateOutfitEditorialImage(
  selection: ValidatedOutfitSelection
): Promise<GenerateImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      error:
        'Chưa tìm thấy GEMINI_API_KEY trong biến môi trường máy chủ. Vui lòng cấu hình API Key trong bảng điều khiển Secrets của AI Studio.',
      errorCode: 'MISSING_API_KEY',
    };
  }

  const prompt = buildFashionEditorialPrompt(selection);
  const modelName = 'gemini-3.1-flash-lite-image';

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '3:4',
        },
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content?.parts) {
      return {
        success: false,
        error: 'Mô hình không trả về nội dung hợp lệ hoặc bộ lọc nội dung đã chặn kết quả.',
        errorCode: 'EMPTY_CANDIDATE',
        prompt,
        model: modelName,
      };
    }

    let foundBase64: string | null = null;
    let foundMime: string = 'image/png';

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        foundBase64 = part.inlineData.data;
        if (part.inlineData.mimeType) {
          foundMime = part.inlineData.mimeType;
        }
        break;
      }
    }

    if (!foundBase64) {
      return {
        success: false,
        error:
          'Phản hồi từ AI không chứa dữ liệu hình ảnh nhị phân. Vui lòng thử lại với bản phối khác.',
        errorCode: 'NO_IMAGE_DATA',
        prompt,
        model: modelName,
      };
    }

    const imageUrl = `data:${foundMime};base64,${foundBase64}`;

    return {
      success: true,
      imageUrl,
      mimeType: foundMime,
      prompt,
      model: modelName,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[ImageService Error]:', errorMsg);

    // Identify quota and billing errors
    if (
      errorMsg.includes('429') ||
      errorMsg.includes('RESOURCE_EXHAUSTED') ||
      errorMsg.includes('quota') ||
      errorMsg.includes('Quota exceeded')
    ) {
      return {
        success: false,
        error:
          'Hạn mức tạo ảnh miễn phí (Free Tier) của mô hình gemini-3.1-flash-lite-image bị giới hạn (limit: 0). Để tạo ảnh thực tế từ mô hình hình ảnh của Google GenAI, dự án cần sử dụng API key có bật thanh toán (Billing Enabled / Paid Key).',
        errorCode: 'QUOTA_EXCEEDED',
        prompt,
        model: modelName,
      };
    }

    if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('403') || errorMsg.includes('PERMISSION_DENIED')) {
      return {
        success: false,
        error: 'Khóa API không hợp lệ hoặc không có quyền truy cập mô hình tạo ảnh này.',
        errorCode: 'PERMISSION_DENIED',
        prompt,
        model: modelName,
      };
    }

    return {
      success: false,
      error: `Lỗi khi gọi API tạo ảnh: ${errorMsg}`,
      errorCode: 'API_ERROR',
      prompt,
      model: modelName,
    };
  }
}
