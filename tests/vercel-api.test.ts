import assert from 'node:assert/strict';
import test from 'node:test';
import { GET as getAIStatus } from '../api/ai-status';
import { GET as getHealth } from '../api/health';
import { POST as postStylist } from '../api/ai-stylist';
import { POST as postImage } from '../api/generate-outfit-image';

async function withKey(value: string | undefined, run: () => Promise<void>): Promise<void> {
  const previous = process.env.GEMINI_API_KEY;
  if (value === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = value;
  try {
    await run();
  } finally {
    if (previous === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previous;
  }
}

function postRequest(path: string, body: string, contentType = 'application/json'): Request {
  return new Request('https://example.vercel.app/api/' + path, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  });
}

test('serverless status and health do not report an absent key as configured', async () => {
  await withKey(undefined, async () => {
    const status = getAIStatus();
    const health = getHealth();
    assert.equal(status.status, 200);
    assert.equal(status.headers.get('cache-control'), 'no-store');
    assert.equal((await status.json()).hasApiKey, false);
    assert.equal((await health.json()).hasApiKey, false);
  });
});

test('serverless status detects the server-side environment key without exposing it', async () => {
  await withKey('test-private-key', async () => {
    const status = await getAIStatus().json();
    assert.equal(status.hasApiKey, true);
    assert.equal(status.isAvailable, true);
    assert.equal(JSON.stringify(status).includes('test-private-key'), false);
  });
});

test('serverless AI routes reject calls when the key is missing', async () => {
  await withKey(undefined, async () => {
    for (const [handler, path] of [
      [postStylist, 'ai-stylist'],
      [postImage, 'generate-outfit-image'],
    ] as const) {
      const response = await handler(postRequest(path, '{}'));
      assert.equal(response.status, 403);
      assert.equal((await response.json()).errorCode, 'MISSING_API_KEY');
    }
  });
});

test('serverless API returns JSON errors on malformed input rather than a platform exception', async () => {
  await withKey('fake-key-not-used', async () => {
    const invalidJson = await postStylist(postRequest('ai-stylist', '{'));
    assert.equal(invalidJson.status, 400);
    assert.equal((await invalidJson.json()).errorCode, 'INVALID_JSON');

    const wrongType = await postImage(postRequest('generate-outfit-image', '{}', 'text/plain'));
    assert.equal(wrongType.status, 415);
    assert.equal((await wrongType.json()).errorCode, 'UNSUPPORTED_MEDIA_TYPE');

    const invalidOutfit = await postImage(postRequest('generate-outfit-image', '{}'));
    assert.equal(invalidOutfit.status, 400);
    assert.equal((await invalidOutfit.json()).errorCode, 'INVALID_REQUEST');
  });
});

test('serverless API keeps the 1 MB Express request-body limit', async () => {
  await withKey('fake-key-not-used', async () => {
    const tooLarge = postRequest('generate-outfit-image', JSON.stringify({ input: 'a'.repeat(1024 * 1024) }));
    const response = await postImage(tooLarge);
    assert.equal(response.status, 413);
    assert.equal((await response.json()).errorCode, 'PAYLOAD_TOO_LARGE');
  });
});

test('Vercel default Fetch exports dispatch HTTP methods without importing app UI', async () => {
  const [health, status, stylist, image] = await Promise.all([
    import('../api/health'),
    import('../api/ai-status'),
    import('../api/ai-stylist'),
    import('../api/generate-outfit-image'),
  ]);
  const getRequest = new Request('https://example.vercel.app/api/health');
  const getResponse = await health.default.fetch(getRequest);
  const statusResponse = await status.default.fetch(new Request('https://example.vercel.app/api/ai-status'));
  assert.equal(getResponse.status, 200);
  assert.equal(statusResponse.status, 200);
  assert.equal((await getResponse.json()).status, 'ok');
  assert.equal((await statusResponse.json()).hasApiKey, Boolean(process.env.GEMINI_API_KEY?.trim()));
  for (const handler of [stylist.default, image.default]) {
    const wrongMethod = await handler.fetch(getRequest);
    assert.equal(wrongMethod.status, 405);
    assert.equal((await wrongMethod.json()).errorCode, 'METHOD_NOT_ALLOWED');
  }
});
