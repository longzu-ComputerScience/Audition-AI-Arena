import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { validateAndResolveOutfit } from './src/server/promptBuilder';
import { generateOutfitEditorialImage } from './src/server/imageService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '1mb' }));

  // API endpoint for Outfit Editorial Image generation
  app.post('/api/generate-outfit-image', async (req, res) => {
    try {
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
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
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
