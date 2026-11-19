/*
 * PARA QUE SERVE: Confere os dados recebidos: IDs, mensagens, papéis e limites de tamanho.
 * QUANDO ENTRA EM AÇÃO: Entra antes de consultar a IA ou gravar uma nova pergunta.
 * QUANDO FAZ DIFERENÇA: Faz diferença quando chega um pedido vazio, grande demais ou com dados inválidos.
 */

const criarErro = (statusCode, message, code) =>
    Object.assign(new Error(message), { statusCode, code })

// Evita que valores como true ou objetos sejam aceitos como IDs por conversão automática.
const validarId = (valor) => {
    if (typeof valor !== 'number' && (typeof valor !== 'string' || !/^\d+$/.test(valor))) return null
    const id = Number(valor)
    return Number.isSafeInteger(id) && id > 0 ? id : null
}

// O cliente pode mandar perguntas e respostas anteriores, mas não um prompt de sistema.
const validarMensagens = (entrada) => {
    if (!Array.isArray(entrada) || entrada.length < 1 || entrada.length > 12)
        throw criarErro(400, 'Envie de 1 a 12 mensagens.', 'IA_ENTRADA_INVALIDA')
    const mensagens = entrada.map((item) => {
        if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string')
            throw criarErro(400, 'Use mensagens com role user ou assistant e content em texto.', 'IA_ENTRADA_INVALIDA')
        const content = item.content.trim()
        const limite = item.role === 'user' ? 2000 : 16000
        if (!content || content.length > limite)
            throw criarErro(400, `A mensagem de ${item.role} deve ter entre 1 e ${limite} caracteres.`, 'IA_ENTRADA_INVALIDA')
        return { role: item.role, content }
    })
    if (mensagens.at(-1).role !== 'user')
        throw criarErro(400, 'A última mensagem precisa ser uma pergunta do usuário.', 'IA_ENTRADA_INVALIDA')
    return mensagens
}

const validarRequisicaoId = (valor) => {
    if (typeof valor !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor))
        throw criarErro(400, 'requisicao_id deve ser um UUID válido.', 'REQUISICAO_ID_INVALIDO')
    return valor.toLowerCase()
}

module.exports = { criarErro, validarId, validarMensagens, validarRequisicaoId }
