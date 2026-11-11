const iaService = require('../../services/publicChatService.js')

const geoapifyPlacesService = require('../../services/geoapifyPlacesService.js')
const presentationPrompt = require('../../ai-presentation-prompt.js')
const systemPrompt = require('../../ai-system-prompt.js')
const enviarEvento = (res, dados) => !res.destroyed && !res.writableEnded && res.write(`data: ${JSON.stringify(dados)}\n\n`)

const conversarPublicamente = async (req, res) => {
    const entrada = req.body?.messages
    if (!Array.isArray(entrada) || entrada.length === 0 || entrada.length > 12) {
        return res.status(400).json({ mensagem: 'Envie de 1 a 12 mensagens para manter o contexto.' })
    }
    const mensagens = entrada.map((item) => {
        if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string') return null
        const content = item.content.trim()
        if (!content || content.length > (item.role === 'assistant' ? 16000 : 2000)) return null
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
    const controlador = new AbortController()
    const cancelar = () => { if (!res.writableEnded) controlador.abort() }
    res.on("close", cancelar)
    try {
        const respostaLugares = await geoapifyPlacesService.respostaLugares(mensagens[mensagens.length - 1].content)
        controlador.signal.throwIfAborted()
        if (respostaLugares) {
            enviarEvento(res, { tipo: 'trecho', conteudo: respostaLugares })
            enviarEvento(res, { tipo: 'fim' })
            return
        }
        await iaService.gerarResposta(
            [{ role: 'system', content: systemPrompt + '\n' + presentationPrompt }, ...mensagens.slice(-10)],
            (trecho) => enviarEvento(res, { tipo: 'trecho', conteudo: trecho }),
            controlador.signal
        )
        enviarEvento(res, { tipo: 'fim' })
    } catch (error) {
        if (controlador.signal.aborted) return
        console.error('Erro na conversa pública com a IA:', error.code || error.message)
        enviarEvento(res, { tipo: 'erro', mensagem: error.message || 'Não foi possível obter resposta da IA.' })
    } finally {
        res.off("close", cancelar)
        res.end()
    }
}

module.exports = { conversarPublicamente }
