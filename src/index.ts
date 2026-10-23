export interface Env {
  AI: Ai;
  CHAT_API_TOKEN: string;
}

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return json({ online: true, service: "assistente-financeira" });
    }

    if (request.method !== "POST" || url.pathname !== "/chat") {
      return json({ error: "Rota não encontrada." }, 404);
    }

    if (!env.CHAT_API_TOKEN) {
      return json({ error: "CHAT_API_TOKEN não foi configurado no Worker." }, 503);
    }

    if (request.headers.get("Authorization") !== `Bearer ${env.CHAT_API_TOKEN}`) {
      return json({ error: "Acesso não autorizado." }, 401);
    }

    let body: { messages?: unknown };
    try {
      body = await request.json() as { messages?: unknown };
    } catch {
      return json({ error: "O corpo da solicitação precisa ser um JSON válido." }, 400);
    }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return json({ error: "Envie o histórico da conversa no campo messages." }, 400);
    }

    try {
      const stream = await env.AI.run("@cf/zai-org/glm-4.7-flash", {
        messages: body.messages as Array<{ role: "system" | "user" | "assistant"; content: string }>,
        stream: true,
      });

      return new Response(stream as ReadableStream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (error) {
      console.error("Workers AI falhou:", error);
      return json({ error: "A Cloudflare não conseguiu gerar a resposta." }, 502);
    }
  },
} satisfies ExportedHandler<Env>;

