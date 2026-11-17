/*
 * PARA QUE SERVE: Conversa com a IA da Cloudflare: envia a pergunta e recebe a resposta.
 * QUANDO ENTRA EM AÇÃO: É usado pelos dois tipos de chat quando precisam gerar uma resposta.
 * QUANDO FAZ DIFERENÇA: Faz diferença ao juntar os pedaços da resposta, lidar com falhas e cancelar a chamada.
 */

const { criarErro, validarMensagens } = require('./chatValidation.js')
const { erroWorker } = require('./chatErrors.js')

// O prompt e o modelo são administrados no Worker. O cliente envia apenas o histórico.
const WORKER_URL_PADRAO = 'https://back-end-fimap.pedroday813.workers.dev/v1/ia/chat-publico'
const TIMEOUT_IA_MS = 120000

// Lê URL e token antes da chamada; o token fica apenas no backend.
const obterConfiguracao = () => {
    let url
    try { url = new URL(process.env.CLOUDFLARE_WORKER_URL || WORKER_URL_PADRAO) }
    catch { throw criarErro(503, 'Configure uma CLOUDFLARE_WORKER_URL válida.', 'IA_CONFIGURACAO') }
    if (!['https:', 'http:'].includes(url.protocol))
        throw criarErro(503, 'A URL da IA precisa usar HTTP ou HTTPS.', 'IA_CONFIGURACAO')
    const token = process.env.CLOUDFLARE_CHAT_TOKEN
    if (['/chat', '/v1/ia/chat'].includes(url.pathname.replace(/\/$/, '')) && !token)
        throw criarErro(503, 'Configure CLOUDFLARE_CHAT_TOKEN para usar a rota protegida /chat.', 'IA_CONFIGURACAO')
    return { url: url.toString(), token }
}
const obterConfiguracaoPrivada = () => {
    const config = obterConfiguracao()
    if (!['/chat', '/v1/ia/chat'].includes(new URL(config.url).pathname.replace(/\/$/, '')) || !config.token)
        throw criarErro(503, 'Configure a rota privada e o token compartilhado da IA.', 'IA_CONFIGURACAO')
    return config
}

// Cada provedor pode usar um formato diferente para o mesmo pedaço de texto.
const extrairTexto = (dados) => {
    if (typeof dados === 'string') return dados
    if (dados?.tipo === 'trecho') return typeof dados.conteudo === 'string' ? dados.conteudo : ''
    const texto = dados?.response ?? dados?.choices?.[0]?.delta?.content ?? dados?.choices?.[0]?.message?.content
    return typeof texto === 'string' ? texto : ''
}

// É o ponto central usado tanto pelo chat público quanto pelo chat com histórico.
const gerarResposta = async (entrada, aoReceberTrecho = () => {}, signal) => {
    const mensagens = validarMensagens(entrada)
    const { url, token } = obterConfiguracao()
    const sinal = signal ? AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_IA_MS)]) : AbortSignal.timeout(TIMEOUT_IA_MS)
    let reader
    let cancelarLeitura
    let respostaCompleta = ''
    let concluido = false
    const adicionar = async (trecho) => {
        sinal.throwIfAborted()
        if (!trecho) return
        if (respostaCompleta.length + trecho.length > 16000)
            throw criarErro(502, 'A resposta da IA excedeu o limite de 16000 caracteres.', 'IA_RESPOSTA_INVALIDA')
        respostaCompleta += trecho
        await aoReceberTrecho(trecho)
    }
    // A IA envia eventos; alguns trazem texto, outros só avisam que terminou.
    const processarEvento = async (evento) => {
        const data = evento.split(/\r?\n/).filter((linha) => linha.startsWith('data:'))
            .map((linha) => linha.slice(5).trimStart()).join('\n').trim()
        if (!data) return
        if (data === '[DONE]') { concluido = true; return }
        let dados
        try { dados = JSON.parse(data) }
        catch { throw criarErro(502, 'A IA retornou um evento inválido.', 'IA_RESPOSTA_INVALIDA') }
        if (dados?.tipo === 'erro' || dados?.error)
            throw erroWorker(502, dados.codigo, dados.retry_after)
        await adicionar(extrairTexto(dados))
        if (dados?.tipo === 'fim' || dados?.choices?.some((item) => item.finish_reason != null)) concluido = true
    }
    try {
        sinal.throwIfAborted()
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream, application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({ messages: mensagens }),
            redirect: 'manual',
            signal: sinal
        })
        if (!response.ok) {
            // Só códigos conhecidos são públicos; nunca repassa mensagem/corpo do provedor.
            let codigo
            if (response.headers.get('Content-Type')?.includes('application/json') && response.body) {
                const leitor = response.body.getReader()
                try {
                    let texto = ''
                    const decoder = new TextDecoder()
                    while (texto.length <= 16384) {
                        const parte = await leitor.read()
                        if (parte.done) break
                        texto += decoder.decode(parte.value, { stream: true })
                    }
                    if (texto.length <= 16384) codigo = JSON.parse(texto).codigo
                } catch {} finally { await leitor.cancel().catch(() => {}); leitor.releaseLock() }
            } else await response.body?.cancel()
            throw erroWorker(response.status, codigo, response.headers.get('Retry-After'))
        }
        if (response.headers.get('Content-Type')?.includes('application/json')) {
            let dados
            try { dados = await response.json() }
            catch { throw criarErro(502, 'A IA retornou um JSON inválido.', 'IA_RESPOSTA_INVALIDA') }
            if (dados?.error || dados?.tipo === 'erro')
                throw erroWorker(502, dados.codigo, dados.retry_after)
            await adicionar(extrairTexto(dados))
            concluido = true
        } else {
            if (!response.body || !response.headers.get('Content-Type')?.includes('text/event-stream')) {
                await response.body?.cancel()
                throw criarErro(502, 'A IA não retornou um fluxo SSE válido.', 'IA_RESPOSTA_INVALIDA')
            }
            reader = response.body.getReader()
            cancelarLeitura = () => { reader.cancel(sinal.reason).catch(() => {}) }
            sinal.addEventListener('abort', cancelarLeitura, { once: true })
            if (sinal.aborted) cancelarLeitura()
            // Um pacote de rede pode terminar no meio de uma letra ou de um evento.
            // O decoder e o buffer preservam o texto até chegar a parte que falta.
            const decoder = new TextDecoder()
            let buffer = ''
            while (!concluido) {
                sinal.throwIfAborted()
                const { value, done } = await reader.read()
                sinal.throwIfAborted()
                buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
                // Impede que um provedor envie um evento sem delimitador indefinidamente.
                if (buffer.length > 262144)
                    throw criarErro(502, 'O evento da IA excedeu o limite permitido.', 'IA_RESPOSTA_INVALIDA')
                const eventos = buffer.split(/\r?\n\r?\n/)
                buffer = eventos.pop() || ''
                for (const evento of eventos) {
                    await processarEvento(evento)
                    if (concluido) break
                }
                if (done) {
                    if (!concluido && buffer.trim()) await processarEvento(buffer)
                    break
                }
            }
        }
        sinal.throwIfAborted()
        if (!concluido) throw criarErro(502, 'A conexão com a IA foi interrompida antes de concluir.', 'IA_FLUXO_INTERROMPIDO')
        if (!respostaCompleta.trim()) throw criarErro(502, 'A IA retornou uma resposta vazia.', 'IA_RESPOSTA_VAZIA')
        return respostaCompleta.trim()
    } catch (error) {
        signal?.throwIfAborted()
        if (sinal.aborted)
            throw criarErro(504, 'A IA demorou demais para responder.', 'IA_TIMEOUT')
        if (error.statusCode) throw error
        throw criarErro(502, 'Não foi possível completar a conexão com a IA.', 'IA_INDISPONIVEL')
    } finally {
        // Libera o stream inclusive quando o usuário para a resposta ou ocorre erro.
        if (cancelarLeitura) sinal.removeEventListener('abort', cancelarLeitura)
        if (reader) {
            await reader.cancel().catch(() => {})
            reader.releaseLock()
        }
    }
}

module.exports = { gerarResposta, obterConfiguracao, obterConfiguracaoPrivada, WORKER_URL_PADRAO }
