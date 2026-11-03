const iaService = require('../../services/publicChatService.js')

const systemPrompt = 'Você é uma assistente financeira pessoal acolhedora e conversacional. Responda sempre em português do Brasil. Ajude com orçamento, gastos, dívidas e metas financeiras de forma simples e sem julgamentos. Não invente dados financeiros; pergunte quando faltarem informações. Suas respostas são informativas e não executam operações financeiras.'
const enviarEvento = (res, dados) => res.write(`data: ${JSON.stringify(dados)}\n\n`)

const conversarPublicamente = async (req, res) => {
    const entrada = req.body?.messages
    if (!Array.isArray(entrada) || entrada.length === 0 || entrada.length > 12) {
        return res.status(400).json({ mensagem: 'Envie de 1 a 12 mensagens para manter o contexto.' })
    }
    const mensagens = entrada.map((item) => {
        if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string') return null
        const content = item.content.trim()
        if (!content || content.length > 2000) return null
        return { role: item.role, content }
    })
    if (mensagens.some((item) => !item) || mensagens[mensagens.length - 1].role !== 'user') {
        return res.status(400).json({ mensagem: 'A última mensagem precisa ser uma pergunta válida de até 2000 caracteres.' })
    }

    res.status(200).set({
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
    })
    res.flushHeaders()
    try {
        await iaService.gerarResposta(
            [{ role: 'system', content: systemPrompt }, ...mensagens.slice(-10)],
            (trecho) => enviarEvento(res, { tipo: 'trecho', conteudo: trecho })
        )
        enviarEvento(res, { tipo: 'fim' })
    } catch (error) {
        console.error('Erro na conversa pública com a IA:', error.code || error.message)
        enviarEvento(res, { tipo: 'erro', mensagem: error.message || 'Não foi possível obter resposta da IA.' })
    } finally {
        res.end()
    }
}

module.exports = { conversarPublicamente }
