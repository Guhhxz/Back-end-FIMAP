const knex = require('knex')
const knexConfig = require('../../Database_config_knex/KnexFile.js')

const db = knex(knexConfig.development)
const PAPEL_USUARIO = 1
const PAPEL_ASSISTENTE = 2
const TIMEOUT_IA_MS = 180000

const erro = (statusCode, message, code) => {
    const error = new Error(message)
    error.statusCode = statusCode
    if (code) error.code = code
    return error
}

const formatarMensagem = (mensagem) => ({
    id: mensagem.id,
    chat_id: mensagem.id_chat,
    papel: Number(mensagem.papel) === PAPEL_USUARIO ? 'usuario' : 'assistente',
    conteudo: mensagem.conteudo,
    data_envio: mensagem.data_envio
})

const buscarChat = async (chatId) => db('tbl_chat')
    .select('id', 'nome', 'id_usuario')
    .where({ id: chatId })
    .first()

const listarMensagensChat = async (chatId, { antesDe, limite = 30 } = {}) => {
    const chat = await buscarChat(chatId)
    if (!chat) return null

    let consulta = db('tbl_mensagem')
        .select('id', 'conteudo', 'data_envio', 'papel', 'id_chat')
        .where('id_chat', chatId)

    if (antesDe !== undefined) consulta = consulta.where('id', '<', antesDe)

    const linhas = await consulta.orderBy('id', 'desc').limit(limite + 1)
    const temMais = linhas.length > limite
    const mensagens = linhas.slice(0, limite).reverse().map(formatarMensagem)

    return {
        mensagens,
        tem_mais: temMais,
        proximo_cursor: temMais && mensagens.length ? mensagens[0].id : null
    }
}

const extrairTrechoCloudflare = (dados) => {
    if (typeof dados === 'string') return dados
    return dados?.response ||
        dados?.choices?.[0]?.delta?.content ||
        dados?.choices?.[0]?.message?.content || ''
}

const transmitirRespostaAssistente = async (chatId, conteudo, idUsuario, aoReceberTrecho) => {
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL || 'http://127.0.0.1:8787/chat'
    const token = process.env.CLOUDFLARE_CHAT_TOKEN
    if (!token) throw erro(503, 'Configure CLOUDFLARE_CHAT_TOKEN no .env.', 'CLOUDFLARE_NOT_CONFIGURED')

    const historico = await db('tbl_mensagem')
        .select('papel', 'conteudo')
        .where({ id_chat: chatId })
        .where('id', '<', idUsuario)
        .orderBy('id', 'desc')
        .limit(9)

    const mensagens = [{
        role: 'system',
        content: 'Você é uma assistente financeira pessoal, acolhedora e conversacional. Responda sempre em português do Brasil. Ajude com orçamento, gastos, dívidas e metas financeiras de forma simples e sem julgamentos. Não ofereça ajuda com programação, a menos que a pessoa peça explicitamente. Não invente dados; pergunte quando faltarem informações.'
    }]
    mensagens.push(...historico.reverse().map((mensagem) => ({
        role: Number(mensagem.papel) === PAPEL_USUARIO ? 'user' : 'assistant',
        content: mensagem.conteudo
    })))
    mensagens.push({ role: 'user', content: conteudo })

    let response
    try {
        response = await fetch(workerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ messages: mensagens }),
            signal: AbortSignal.timeout(TIMEOUT_IA_MS)
        })
    } catch (cause) {
        if (cause.name === 'TimeoutError' || cause.name === 'AbortError') {
            throw erro(503, 'A Cloudflare excedeu o tempo limite.', 'CLOUDFLARE_TIMEOUT')
        }
        throw erro(503, 'Não foi possível conectar ao Worker da Cloudflare.', 'CLOUDFLARE_UNAVAILABLE')
    }

    if (!response.ok) {
        const corpoErro = await response.text().catch(() => '')
        let mensagemErro = `O Worker da Cloudflare respondeu com status ${response.status}.`
        try { mensagemErro = JSON.parse(corpoErro).error || mensagemErro } catch {}
        if (response.status === 401) throw erro(503, mensagemErro, 'CLOUDFLARE_AUTH_ERROR')
        if (response.status === 404) throw erro(503, mensagemErro, 'CLOUDFLARE_URL_ERROR')
        throw erro(502, mensagemErro, 'CLOUDFLARE_PROVIDER_ERROR')
    }
    if (!response.body) throw erro(502, 'A Cloudflare não retornou um fluxo de resposta.', 'CLOUDFLARE_INVALID_RESPONSE')

    let respostaCompleta = ''
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    try {
        while (true) {
            const { value, done } = await reader.read()
            buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
            const eventos = buffer.split(/\r?\n\r?\n/)
            buffer = eventos.pop() || ''

            for (const evento of eventos) {
                const dadosEvento = evento.split(/\r?\n/)
                    .filter((linha) => linha.startsWith('data:'))
                    .map((linha) => linha.slice(5).trim())
                    .join('\n')
                if (!dadosEvento || dadosEvento === '[DONE]') continue
                let dados
                try { dados = JSON.parse(dadosEvento) } catch { dados = dadosEvento }
                const trecho = extrairTrechoCloudflare(dados)
                if (trecho) {
                    respostaCompleta += trecho
                    aoReceberTrecho(trecho)
                }
            }
            if (done) break
        }
        if (buffer.trim()) {
            const dadosEvento = buffer.split(/\r?\n/)
                .filter((linha) => linha.startsWith('data:'))
                .map((linha) => linha.slice(5).trim())
                .join('\n')
            if (dadosEvento && dadosEvento !== '[DONE]') {
                let dados
                try { dados = JSON.parse(dadosEvento) } catch { dados = dadosEvento }
                const trecho = extrairTrechoCloudflare(dados)
                if (trecho) { respostaCompleta += trecho; aoReceberTrecho(trecho) }
            }
        }
    } catch (cause) {
        if (cause.code) throw cause
        throw erro(502, 'O fluxo de resposta da Cloudflare era inválido.', 'CLOUDFLARE_INVALID_RESPONSE')
    }

    respostaCompleta = respostaCompleta.trim()
    if (!respostaCompleta) throw erro(502, 'A Cloudflare retornou uma resposta vazia.', 'CLOUDFLARE_INVALID_RESPONSE')

    const [idAssistente] = await db('tbl_mensagem').insert({
        conteudo: respostaCompleta,
        data_envio: new Date(),
        papel: PAPEL_ASSISTENTE,
        id_chat: chatId
    })
    const linha = await db('tbl_mensagem')
        .select('id', 'conteudo', 'data_envio', 'papel', 'id_chat')
        .where({ id: idAssistente })
        .first()
    return formatarMensagem(linha)
}

const iniciarMensagemChat = async (chatId, conteudo, aoReceberTrecho) => {
    const chat = await buscarChat(chatId)
    if (!chat) return null

    const [idUsuario] = await db('tbl_mensagem').insert({
        conteudo,
        data_envio: new Date(),
        papel: PAPEL_USUARIO,
        id_chat: chatId
    })
    const linhaUsuario = await db('tbl_mensagem')
        .select('id', 'conteudo', 'data_envio', 'papel', 'id_chat')
        .where({ id: idUsuario })
        .first()
    const mensagemUsuario = formatarMensagem(linhaUsuario)
    const mensagemAssistente = await transmitirRespostaAssistente(chatId, conteudo, idUsuario, aoReceberTrecho)
    return { mensagem_usuario: mensagemUsuario, mensagem_assistente: mensagemAssistente }
}

module.exports = { listarMensagensChat, iniciarMensagemChat }
