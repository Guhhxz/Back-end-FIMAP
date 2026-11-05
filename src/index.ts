import presentationPrompt from "./ai-presentation-prompt.js";
import systemPrompt from "./ai-system-prompt.js";
import financialChat from "./services/financial/financialChatOrchestrator.js";
export type Env = Cloudflare.Env & {
  HG_BRASIL_API_KEY?: string;
  BRAPI_TOKEN?: string;
  FINANCIAL_TOOLS_ENABLED?: string;
};

const ultimaPerguntaPorIp = new Map<string, number>();
let ultimaLimpeza = Date.now();
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { ...corsHeaders, "Cache-Control": "no-store" } });

const criarFluxoDoChat = (origem: ReadableStream, encoder: TextEncoder, onCancel: () => void) => {
  const reader = origem.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let cancelled = false;
  return new ReadableStream({
    async pull(controller) {
      let emitted = false;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (cancelled) return;
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
            if (conteudo) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tipo: "trecho", conteudo })}\n\n`));
              emitted = true;
            }
            if (dados.error) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tipo: "erro", mensagem: dados.error })}\n\n`));
              emitted = true;
            }
          }
          if (!done && emitted) return;
          if (done) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tipo: "fim" })}\n\n`));
            controller.close();
            return;
          }
        }
      } catch {
        if (cancelled) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tipo: "erro", mensagem: "A conexão com a IA foi interrompida." })}\n\n`));
        controller.close();
      }
    },
    cancel(reason) { cancelled = true; onCancel(); return reader.cancel(reason); },
  });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") return json({ online: true, service: "assistente-financeira" });
    const rotaChatPublico = url.pathname === "/v1/ia/chat-publico";
    const rotaLegada = url.pathname === "/chat";
    if ((rotaChatPublico || rotaLegada) && request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== "POST" || (!rotaChatPublico && !rotaLegada)) return json({ mensagem: "Rota não encontrada." }, 404);

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
      const mensagensComFerramentas = await financialChat.prepareFinancialMessages(
        mensagens, env,
        (inputs) => env.AI.run("@cf/google/gemma-4-26b-a4b-it", inputs),
        { signal: request.signal, logger: (dados) => console.info(JSON.stringify(dados)) }
      );
      request.signal.throwIfAborted();
      const stream = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", {
        messages: mensagensComFerramentas as Array<{ role: "system" | "user" | "assistant"; content: string }>,
        stream: true,
        temperature: 0.6,
        chat_template_kwargs: { enable_thinking: true },
      });
      if (rotaLegada) return new Response(stream as ReadableStream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" } });
      return new Response(criarFluxoDoChat(stream as ReadableStream, new TextEncoder(), () => {
        if (ultimaPerguntaPorIp.get(ip) === agora) ultimaPerguntaPorIp.delete(ip);
      }), { headers: { ...corsHeaders, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Content-Type-Options": "nosniff" } });
    } catch (error) {
      console.error("Workers AI falhou ao gerar a resposta.");
      return json({ mensagem: "A Cloudflare não conseguiu gerar a resposta." }, 502);
    }
  },
} satisfies ExportedHandler<Env>;


