const TIMEOUT_IA_MS = 180000
const { WORKER_URL_PADRAO } = require('../config/ia.js')

const criarErro = (message, code) => Object.assign(new Error(message), { code })
const isConfigurado = () => Boolean(process.env.CLOUDFLARE_WORKER_URL || WORKER_URL_PADRAO)

const extrairConteudo = (dados) => {
    if (typeof dados === 'string') return dados
    return dados?.response || dados?.choices?.[0]?.delta?.content || dados?.choices?.[0]?.message?.content || ''
}

const gerarResposta = async (mensagens, aoReceberTrecho, signal) => {
    const url = process.env.CLOUDFLARE_WORKER_URL || WORKER_URL_PADRAO
    let resposta
    try {
        resposta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: mensagens }),
            signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_IA_MS)]) : AbortSignal.timeout(TIMEOUT_IA_MS)
        })
    } catch (error) {
        signal?.throwIfAborted()
        throw criarErro(error.name === 'TimeoutError' ? 'A IA demorou demais para responder.' : 'Não foi possível conectar à IA na nuvem.', 'IA_INDISPONIVEL')
    }
    if (!resposta.ok) {
        console.error('Worker da IA respondeu com status:', resposta.status)
        throw criarErro(`O serviço de IA respondeu com status ${resposta.status}.`, 'IA_PROVEDOR')
    }
    if (!resposta.body) throw criarErro('A IA não retornou um fluxo de resposta.', 'IA_RESPOSTA_INVALIDA')

    const reader = resposta.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let respostaCompleta = ''
    const processarEvento = (evento) => {
        const dadosEvento = evento.split(/\r?\n/).filter((linha) => linha.startsWith('data:'))
            .map((linha) => linha.slice(5).trim()).join('\n')
        if (!dadosEvento || dadosEvento === '[DONE]') return
        let dados
        try { dados = JSON.parse(dadosEvento) } catch { dados = dadosEvento }
        const trecho = extrairConteudo(dados)
        if (trecho) { respostaCompleta += trecho; aoReceberTrecho(trecho) }
    }
    try {
        while (true) {
            const { value, done } = await reader.read()
            buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
            const eventos = buffer.split(/\r?\n\r?\n/)
            buffer = eventos.pop() || ''
            eventos.forEach(processarEvento)
            if (done) break
        }
        if (buffer.trim()) processarEvento(buffer)
    } catch (error) {
        signal?.throwIfAborted()
        if (error.code) throw error
        throw criarErro('A conexão com a IA foi interrompida.', 'IA_FLUXO_INTERROMPIDO')
    }
    signal?.throwIfAborted()
    if (!respostaCompleta.trim()) throw criarErro('A IA retornou uma resposta vazia.', 'IA_RESPOSTA_VAZIA')
    return respostaCompleta.trim()
}

module.exports = { isConfigurado, gerarResposta }
