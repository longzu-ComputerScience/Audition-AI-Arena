import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { validateAndResolveOutfit } from './src/server/promptBuilder';
import { generateOutfitEditorialImage } from './src/server/imageService';
import { generateStylistAdvice } from './src/server/stylistService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '1mb' }));

  // AI Availability Status Endpoint
  app.get('/api/ai-status', (_req, res) => {
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    res.json({
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
  });

  // API endpoint for AI Stylist consultation
  app.post('/api/ai-stylist', async (req, res) => {
    try {
      const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
      if (!hasApiKey) {
        return res.status(403).json({
          success: false,
          error:
            'Chưa cấu hình GEMINI_API_KEY trong biến môi trường máy chủ. Vui lòng cấu hình API Key trong Secrets của AI Studio để mở khóa Trợ lý AI Stylist.',
          errorCode: 'MISSING_API_KEY',
        });
      }

      const result = await generateStylistAdvice(req.body);
      return res.status(200).json(result);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[Server Error /api/ai-stylist]:', errorMsg);
      return res.status(500).json({
        success: false,
        error: 'Đã xảy ra lỗi máy chủ nội bộ khi xử lý tư vấn phong cách.',
        errorCode: 'INTERNAL_SERVER_ERROR',
      });
    }
  });

  // API endpoint for Outfit Editorial Image generation
  app.post('/api/generate-outfit-image', async (req, res) => {
    try {
      const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
      if (!hasApiKey) {
        return res.status(403).json({
          success: false,
          error:
            'Chưa cấu hình GEMINI_API_KEY trong biến môi trường máy chủ. Vui lòng cấu hình API Key trong Secrets của AI Studio để tạo ảnh minh họa AI.',
          errorCode: 'MISSING_API_KEY',
        });
      }

      const validation = validateAndResolveOutfit(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
          errorCode: 'INVALID_REQUEST',
        });
      }

      const result = await generateOutfitEditorialImage(validation.data);
      return res.status(200).json(result);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[Server Error /api/generate-outfit-image]:', errorMsg);
      return res.status(500).json({
        success: false,
        error: 'Đã xảy ra lỗi máy chủ nội bộ khi xử lý tạo ảnh.',
        errorCode: 'INTERNAL_SERVER_ERROR',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    res.json({
      status: 'ok',
      isAvailable: hasApiKey,
      hasApiKey,
      timestamp: new Date().toISOString(),
    });
  });

  // In development, mount Vite's connect instance as middleware
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built dist directory
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Việt Phục Remix Server] listening on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
