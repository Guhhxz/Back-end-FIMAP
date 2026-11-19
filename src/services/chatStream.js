const { criarErro } = require('./chatValidation.js')
const { publico, retrySeguro } = require('./chatErrors.js')

const responderErro = (res, error) => {
    console.error('Falha no chat:', publico(error).codigo)
    const retry = retrySeguro(error.retryAfter)
    if (retry) res.set({ 'Retry-After': retry })
    return res.status(error.statusCode || 500).json(publico(error))
}

// Espera o cliente consumir o buffer, com prazo e limpeza de todos os listeners.
const esperarDrain = (res, signal) => new Promise((resolve, reject) => {
    const limpar = () => {
        clearTimeout(timer)
        res.off('drain', pronto); res.off('close', fechar); res.off('error', fechar)
        signal.removeEventListener('abort', fechar)
    }
    const pronto = () => { limpar(); resolve() }
    const fechar = () => { limpar(); reject(signal.reason || criarErro(499, 'Conexão encerrada.', 'REQUISICAO_CANCELADA')) }
    const timer = setTimeout(() => { limpar(); reject(criarErro(504, 'O cliente não está consumindo a resposta.', 'CHAT_CLIENTE_LENTO')) }, 10000)
    res.once('drain', pronto); res.once('close', fechar); res.once('error', fechar)
    signal.addEventListener('abort', fechar, { once: true })
    if (signal.aborted || res.destroyed || res.writableEnded) fechar()
})

const transmitir = async (res, executar) => {
    const controlador = new AbortController()
    let iniciado = false
    const cancelar = () => { if (!res.writableEnded) controlador.abort() }
    const enviar = async (dados) => {
        controlador.signal.throwIfAborted()
        if (res.destroyed || res.writableEnded) throw criarErro(499, 'Conexão encerrada.', 'REQUISICAO_CANCELADA')
        if (!iniciado) {
            res.status(200).set({ 'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' })
            res.flushHeaders()
            iniciado = true
        }
        if (!res.write(`data: ${JSON.stringify(dados)}\n\n`)) await esperarDrain(res, controlador.signal)
    }
    res.on('close', cancelar)
    try {
        const resultado = await executar((conteudo) => enviar({ tipo: 'trecho', conteudo }), controlador.signal)
        await enviar({ ...resultado, tipo: 'fim' })
    } catch (error) {
        if (!controlador.signal.aborted && !res.destroyed && !res.writableEnded) {
            if (!iniciado) responderErro(res, error)
            else {
                console.error('Falha no streaming do chat:', publico(error).codigo)
                try { await enviar({ tipo: 'erro', ...publico(error),
                    ...(retrySeguro(error.retryAfter) ? { retry_after: error.retryAfter } : {}) }) }
                catch { /* Cliente lento ou desconectado; o serviço já finalizou a solicitação. */ }
            }
        }
    } finally {
        res.off('close', cancelar)
        if (!res.destroyed && !res.writableEnded) res.end()
    }
}
module.exports = { transmitir, responderErro }
