// Temporary isolated diagnostic for Vercel Functions startup; remove after root-cause verification.
export default {
  fetch(request: Request): Response {
    return Response.json({ ok: true, method: request.method, node: process.version }, { headers: { 'Cache-Control': 'no-store' } });
  },
};
