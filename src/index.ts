export interface Env {
  AI: Ai;
  CHAT_RATE_LIMITER: RateLimit;
  ASSETS: Fetcher;
}

const ultimaPerguntaPorIp = new Map<string, number>();
let ultimaLimpeza = Date.now();
const systemPrompt = "Você é uma assistente financeira pessoal acolhedora e conversacional. Responda sempre em português do Brasil. Ajude com orçamento, gastos, dívidas e metas financeiras de forma simples e sem julgamentos. Não invente dados financeiros; pergunte quando faltarem informações. Suas respostas são informativas e não executam operações financeiras.";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { ...corsHeaders, "Cache-Control": "no-store" } });

const criarFluxoDoChat = (origem: ReadableStream, encoder: TextEncoder) => {
  const reader = origem.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  return new ReadableStream({
    async pull(controller) {
      try {
        while (true) {
          const { value, done } = await reader.read();
          buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
          const eventos = buffer.split(/\r?\n\r?\n/);
          buffer = eventos.pop() || "";
          for (const evento of eventos) {
            const linha = evento.split(/\r?\n/).find((item) => item.startsWith("data:"));
            if (!linha) continue;
            const bruto = linha.slice(5).trim();
            if (!bruto || bruto === "[DONE]") continue;
            let dados: { response?: string; error?: string; choices?: Array<{ delta?: { content?: string | null }; message?: { content?: string | null } }> };
            try { dados = JSON.parse(bruto); } catch { continue; }
            const conteudo = dados.response || dados.choices?.[0]?.delta?.content || dados.choices?.[0]?.message?.content || "";
            if (conteudo) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tipo: "trecho", conteudo })}\n\n`));
            if (dados.error) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tipo: "erro", mensagem: dados.error })}\n\n`));
          }
          if (done) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tipo: "fim" })}\n\n`));
            controller.close();
            return;
          }
        }
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tipo: "erro", mensagem: "A conexão com a IA foi interrompida." })}\n\n`));
        controller.close();
      }
    },
    cancel(reason) { return reader.cancel(reason); },
  });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") return json({ online: true, service: "assistente-financeira" });
    const rotaChatPublico = url.pathname === "/v1/ia/chat-publico";
    const rotaLegada = url.pathname === "/chat";
    if ((rotaChatPublico || rotaLegada) && request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== "POST" || (!rotaChatPublico && !rotaLegada)) return env.ASSETS.fetch(request);

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const agora = Date.now();
    const ultimaPergunta = ultimaPerguntaPorIp.get(ip);
    if (agora - ultimaLimpeza > 60_000) {
      for (const [chave, horario] of ultimaPerguntaPorIp) if (agora - horario >= 60_000) ultimaPerguntaPorIp.delete(chave);
      ultimaLimpeza = agora;
    }
    if (ultimaPergunta && agora - ultimaPergunta < 5_000) {
      const segundos = Math.ceil((5_000 - (agora - ultimaPergunta)) / 1_000);
      return json({ mensagem: `Aguarde ${segundos} segundo(s) antes de enviar outra pergunta.` }, 429);
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
      return papeisPermitidos.includes(String(mensagem.role)) && typeof mensagem.content === "string" && mensagem.content.trim().length > 0 && mensagem.content.length <= 2000;
    });
    if (!validas) return json({ mensagem: "Mensagem inválida ou maior que 2000 caracteres." }, 400);

    const mensagens = rotaChatPublico ? [{ role: "system", content: systemPrompt }, ...body.messages] : body.messages;
    try {
      const stream = await env.AI.run("@cf/zai-org/glm-4.7-flash", { messages: mensagens as Array<{ role: "system" | "user" | "assistant"; content: string }>, stream: true, chat_template_kwargs: { enable_thinking: false } });
      if (rotaLegada) return new Response(stream as ReadableStream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" } });
      return new Response(criarFluxoDoChat(stream as ReadableStream, new TextEncoder()), { headers: { ...corsHeaders, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Content-Type-Options": "nosniff" } });
    } catch (error) {
      console.error("Workers AI falhou:", error);
      return json({ mensagem: "A Cloudflare não conseguiu gerar a resposta." }, 502);
    }
  },
} satisfies ExportedHandler<Env>;


