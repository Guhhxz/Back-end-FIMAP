import presentationPrompt from "./ai-presentation-prompt.js";
import systemPrompt from "./ai-system-prompt.js";
import financialChat from "./services/financial/financialChatOrchestrator.js";
export type Env = Cloudflare.Env & {
  HG_BRASIL_API_KEY?: string;
  BRAPI_TOKEN?: string;
  FINANCIAL_TOOLS_ENABLED?: string;
};

const json = (body: unknown, status = 200) =>
  Response.json(body, { 
    status, 
    headers: { 
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*" // Libera o navegador para ler o erro se houver
    } 
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") return json({ online: true, service: "assistente-financeira" });
    const rotaChatPublico = url.pathname === "/v1/ia/chat-publico";
    const rotaLegada = url.pathname === "/chat";
    if ((rotaChatPublico || rotaLegada) && request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== "POST" || (!rotaChatPublico && !rotaLegada)) return json({ mensagem: "Rota não encontrada." }, 404);

    // 1. BLOCO NOVO: Libera o CORS para o seu HTML fazer a requisição sem ser bloqueado
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (request.method === "GET" && url.pathname === "/") {
      return json({ online: true, service: "assistente-financeira" });
    }

    // A rota aceita é apenas "/chat"
    if (request.method !== "POST" || url.pathname !== "/chat") {
      return json({ error: "Rota não encontrada." }, 404);
    }

    if (!env.CHAT_API_TOKEN) {
      return json({ error: "CHAT_API_TOKEN não foi configurado no Worker." }, 503);
    }

    if (request.headers.get("Authorization") !== `Bearer ${env.CHAT_API_TOKEN}`) {
      return json({ error: "Acesso não autorizado." }, 401);
    }
    ultimaPerguntaPorIp.set(ip, agora);
    const limite = await env.CHAT_RATE_LIMITER.limit({ key: ip });
    if (!limite.success) return json({ mensagem: "Limite de uso atingido. Tente novamente mais tarde." }, 429);

    let body: { messages?: unknown };
    try { body = await request.json() as { messages?: unknown }; }
    catch { return json({ mensagem: "O corpo precisa ser um JSON válido." }, 400); }
    if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 12) return json({ mensagem: "Envie de 1 a 12 mensagens." }, 400);
    const validas = body.messages.every((item) => {
      if (!item || typeof item !== "object") return false;
      const mensagem = item as { role?: unknown; content?: unknown };
      const papeisPermitidos = rotaLegada ? ["system", "user", "assistant"] : ["user", "assistant"];
      // O backend envia o prompt compartilhado completo na rota legada.
      // Apenas essas versões conhecidas podem ultrapassar o limite comum.
      const promptCompartilhado = rotaLegada && mensagem.role === "system" &&
        (mensagem.content === systemPrompt || mensagem.content === systemPrompt + "\n" + presentationPrompt);
      return papeisPermitidos.includes(String(mensagem.role)) && typeof mensagem.content === "string" && mensagem.content.trim().length > 0 &&
        (promptCompartilhado || mensagem.content.length <= (mensagem.role === "assistant" ? 16000 : 2000));
    });
    if (!validas) return json({ mensagem: "Mensagem inválida ou maior que 2000 caracteres." }, 400);

    const mensagens = rotaChatPublico ? [{ role: "system", content: systemPrompt + "\n" + presentationPrompt }, ...body.messages] : body.messages;
    try {
      const stream = await env.AI.run("@cf/zai-org/glm-4.7-flash", {
        messages: mensagens as Array<{ role: "system" | "user" | "assistant"; content: string }>,
        stream: true,
        temperature: 0.6,
        chat_template_kwargs: { enable_thinking: true },
      });

      return new Response(stream as ReadableStream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Content-Type-Options": "nosniff",
          "Access-Control-Allow-Origin": "*" // Permite o streaming de texto no navegador
        },
      });
    } catch (error) {
      console.error("Workers AI falhou ao gerar a resposta.");
      return json({ mensagem: "A Cloudflare não conseguiu gerar a resposta." }, 502);
    }
  },
} satisfies ExportedHandler<Env>;
