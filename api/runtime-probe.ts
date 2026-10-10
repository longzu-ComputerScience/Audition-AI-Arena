// Temporary diagnostic: verify the actual file layout of a Vercel Function bundle.
export default {
  async fetch(request: Request): Promise<Response> {
    const mode = new URL(request.url).searchParams.get('module');
    if (mode) {
      try {
        const fs = await import('node:fs');
        const filePaths = ['/var/task/src/server/serverlessHttp.js', '/var/task/src/server/serverlessHttp.ts', '/var/task/src/server/serverlessHttp'];
        const exists = Object.fromEntries(filePaths.map((p) => [p.split('/').at(-1), fs.existsSync(p)]));
        if (mode === 'files') return Response.json({ exists });
        const imported = mode === 'js' ? await import('../src/server/serverlessHttp.js')
          : mode === 'ts' ? await import('../src/server/serverlessHttp.ts')
          : await import('../src/server/serverlessHttp');
        return Response.json({ ok: true, exists, exports: Object.keys(imported) });
      } catch (error: unknown) {
        const exception = error instanceof Error ? error : new Error(String(error));
        return Response.json({ ok: false, name: exception.name, message: exception.message.slice(0, 450) });
      }
    }
    return Response.json({ ok: true, method: request.method, node: process.version });
  },
};
