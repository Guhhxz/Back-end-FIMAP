const { createHash, randomUUID } = require('node:crypto')
const dao = require('../../model/DAO/MensagemChat/RequisicaoChatDAO.js')
const { formatarMensagem } = require('../../model/DAO/MensagemChat/MensagemChatDAO.js')
const ia = require('./aiChatService.js')
const { criarErro, validarMensagens } = require('./chatValidation.js')

const erroEstado = (r) => criarErro(r.status_erro || 409,
    r.estado === 'gerando' ? 'A solicitação já está em andamento. Consulte seu estado.'
        : 'Esta solicitação foi encerrada. Consulte seu estado antes de iniciar outra.',
    r.codigo_erro || 'REQUISICAO_EM_ANDAMENTO')

const resultado = async (r) => {
    const par = await dao.resultado(r)
    return { id_chat: r.id_chat, requisicao_id: r.requisicao_id,
        mensagem_usuario: formatarMensagem(par.mensagem_usuario),
        mensagem_assistente: formatarMensagem(par.mensagem_assistente) }
}
const consultar = async (usuario, uuid) => {
    const r = await dao.consultar(usuario, uuid)
    return { requisicao_id: r.requisicao_id, id_chat: r.id_chat, estado: r.estado,
        codigo: r.codigo_erro || null, retry_after: r.retry_after || null,
        ...(r.estado === 'concluida' ? { resultado: await resultado(r) } : {}) }
}
const cancelar = async (usuario, uuid) => {
    const r = await dao.consultar(usuario, uuid)
    await dao.finalizar(r, 'cancelada', 'REQUISICAO_CANCELADA')
    return consultar(usuario, uuid)
}

const gerar = async (usuario, chat, uuid, pergunta, trecho, signal) => {
    const hash = createHash('sha256').update(JSON.stringify({ chat, pergunta })).digest('hex')
    const reserva = await dao.reservar({ id_usuario: usuario, id_chat: chat, requisicao_id: uuid,
        hash_pedido: hash, pergunta, dono_lease: randomUUID() })
    const r = reserva.requisicao
    if (!reserva.nova) {
        if (r.estado !== 'concluida') throw Object.assign(erroEstado(r), { retryAfter: r.retry_after })
        const salvo = await resultado(r)
        await trecho(salvo.mensagem_assistente.conteudo)
        return { ...salvo, recuperada: true }
    }
    const controle = new AbortController()
    const prazo = AbortSignal.timeout(120000)
    const combinado = AbortSignal.any([controle.signal, prazo, ...(signal ? [signal] : [])])
    let timer, encerrado = false
    // Consulta durável permite cancelar a geração que está em outra instância.
    const verificar = async () => {
        try {
            const atual = await dao.consultar(usuario, uuid)
            if (atual.estado !== 'gerando') controle.abort(erroEstado(atual))
        } catch { controle.abort(criarErro(500, 'Falha ao verificar a solicitação.', 'CHAT_BANCO')) }
        if (!encerrado && !controle.signal.aborted) timer = setTimeout(verificar, 1000)
    }
    timer = setTimeout(verificar, 1000)
    try {
        combinado.throwIfAborted()
        ia.obterConfiguracaoPrivada()
        const contexto = validarMensagens([...(await dao.contexto(r)), { role: 'user', content: pergunta }])
        combinado.throwIfAborted()
        const atual = await dao.consultar(usuario, uuid)
        if (atual.estado !== 'gerando') throw erroEstado(atual)
        const texto = await ia.gerarResposta(contexto, trecho, combinado)
        combinado.throwIfAborted()
        const concluida = await dao.concluir(r, texto)
        return await resultado(concluida)
    } catch (causa) {
        const error = prazo.aborted ? criarErro(504, 'A IA demorou demais para responder.', 'IA_TIMEOUT')
            : controle.signal.aborted ? controle.signal.reason
            : signal?.aborted ? criarErro(409, 'Solicitação cancelada.', 'REQUISICAO_CANCELADA') : causa
        const estado = error.code === 'REQUISICAO_CANCELADA' ? 'cancelada' : 'falhou'
        try { await dao.finalizar(r, estado, error.statusCode ? error.code : 'CHAT_BANCO', error.statusCode || 500, error.retryAfter || null) }
        catch { console.error('Falha no chat:', 'CHAT_BANCO_ESTADO') }
        throw error
    } finally {
        encerrado = true
        clearTimeout(timer)
    }
}

module.exports = { gerar, consultar, cancelar }
