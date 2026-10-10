// Temporary diagnostic: compare a self-contained function with a runtime module import.
export default {
  async fetch(request: Request): Promise<Response> {
    if (new URL(request.url).searchParams.get('module') === 'http') {
      try {
        const imported = await import('../src/server/serverlessHttp');
        return Response.json({ ok: true, exports: Object.keys(imported) });
      } catch (error: unknown) {
        const exception = error instanceof Error ? error : new Error(String(error));
        return Response.json({ ok: false, name: exception.name, message: exception.message.slice(0, 450) });
      }
    }
    return Response.json({ ok: true, method: request.method, node: process.version });
  },
};
