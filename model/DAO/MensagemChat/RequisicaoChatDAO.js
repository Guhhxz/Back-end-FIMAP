// Reservas curtas no MySQL; nenhuma transação fica aberta durante a inferência.
const db = require('../../Database_config_knex/connection.js')
const { criarErro } = require('../../../src/services/chatValidation.js')

const TABELA = 'tbl_chat_requisicao'
const LEASE_MS = 150000
const naoEncontrado = () => criarErro(404, 'Chat ou solicitação não encontrado.', 'CHAT_NAO_ENCONTRADO')
const agora = async (trx) => {
    const [[row]] = await trx.raw('select floor(unix_timestamp(current_timestamp(3)) * 1000) as agora_ms')
    return Number(row.agora_ms)
}
const expirar = (trx, usuario, now) => trx(TABELA).where({ id_usuario: usuario, estado: 'gerando' })
    .where('lease_ate_ms', '<=', now).update({ estado: 'expirada', chat_ativo: null,
        codigo_erro: 'REQUISICAO_EXPIRADA', status_erro: 409 })

// A linha do usuário serializa também limites entre conversas e instâncias.
const transacao = (usuario, chat, executar) => db.transaction(async (trx) => {
    if (!await trx('tbl_usuario').where('id', usuario).select('id').forUpdate().first()) throw naoEncontrado()
    const conversa = await trx('tbl_chat').where({ id: chat, id_usuario: usuario }).forUpdate().first()
    if (!conversa) throw naoEncontrado()
    const now = await agora(trx)
    await expirar(trx, usuario, now)
    return executar(trx, now)
})

const reservar = (pedido) => transacao(pedido.id_usuario, pedido.id_chat, async (trx, now) => {
    const anterior = await trx(TABELA).where({ id_usuario: pedido.id_usuario, requisicao_id: pedido.requisicao_id }).first()
    if (anterior) {
        if (Number(anterior.id_chat) !== pedido.id_chat || anterior.hash_pedido !== pedido.hash_pedido)
            throw criarErro(409, 'Este requisicao_id já foi usado com outro conteúdo ou conversa.', 'REQUISICAO_CONFLITO')
        return { nova: false, requisicao: anterior }
    }
    if (await trx(TABELA).where('chat_ativo', pedido.id_chat).first())
        throw criarErro(409, 'Já existe uma geração ativa nesta conversa.', 'CHAT_EM_ANDAMENTO')
    const [{ total }] = await trx(TABELA).where('id_usuario', pedido.id_usuario).where('criada_ms', '>', now - 60000).count('* as total')
    const [{ ativas }] = await trx(TABELA).where({ id_usuario: pedido.id_usuario, estado: 'gerando' }).count('* as ativas')
    if (Number(total) >= 12 || Number(ativas) >= 2)
        throw Object.assign(criarErro(429, 'Limite de solicitações do usuário atingido.', 'CHAT_LIMITE_USUARIO'), { retryAfter: '60' })
    if (await trx(TABELA).where('id_chat', pedido.id_chat).where('criada_ms', '>', now - 5000).first())
        throw Object.assign(criarErro(429, 'Aguarde cinco segundos entre perguntas nesta conversa.', 'CHAT_LIMITE_CONVERSA'), { retryAfter: '5' })
    const linha = { ...pedido, estado: 'gerando', chat_ativo: pedido.id_chat,
        criada_ms: now, lease_ate_ms: now + LEASE_MS }
    const [id] = await trx(TABELA).insert(linha)
    return { nova: true, requisicao: { ...linha, id } }
})

const consultar = async (usuario, uuid) => {
    const linha = await db(TABELA).where({ id_usuario: usuario, requisicao_id: uuid }).first()
    if (!linha) throw naoEncontrado()
    return transacao(usuario, linha.id_chat, (trx) => trx(TABELA).where({ id: linha.id, id_usuario: usuario }).first())
}

const resultado = async (requisicao) => {
    const linhas = await db('tbl_mensagem as m').join('tbl_chat as c', 'c.id', 'm.id_chat')
        .where('c.id_usuario', requisicao.id_usuario).where('c.id', requisicao.id_chat)
        .whereIn('m.id', [requisicao.id_mensagem_usuario, requisicao.id_mensagem_assistente])
        .select('m.id', 'm.conteudo', 'm.papel', 'm.data_envio', 'm.id_chat')
    const usuario = linhas.find((m) => Number(m.id) === Number(requisicao.id_mensagem_usuario))
    const assistente = linhas.find((m) => Number(m.id) === Number(requisicao.id_mensagem_assistente))
    if (!usuario || !assistente) throw criarErro(500, 'Não foi possível recuperar o resultado salvo.', 'CHAT_BANCO')
    return { mensagem_usuario: usuario, mensagem_assistente: assistente }
}

const contexto = async (requisicao) => {
    // Mensagens legadas também são preservadas: uma resposta antiga só era salva ao concluir.
    // Perguntas órfãs não formam um par e nunca entram no contexto.
    const linhas = await db('tbl_mensagem as m').join('tbl_chat as c', 'c.id', 'm.id_chat')
        .where('c.id', requisicao.id_chat).where('c.id_usuario', requisicao.id_usuario)
        .select('m.papel', 'm.conteudo').orderBy('m.data_envio', 'asc').orderBy('m.id', 'asc')
    const pares = []
    let pergunta
    for (const m of linhas) {
        if (Number(m.papel) === 1) pergunta = m.conteudo
        else if (Number(m.papel) === 2 && pergunta) {
            pares.push([{ role: 'user', content: pergunta }, { role: 'assistant', content: m.conteudo }])
            if (pares.length > 5) pares.shift()
            pergunta = null
        }
    }
    return pares.flat()
}

const concluir = (r, texto) => transacao(r.id_usuario, r.id_chat, async (trx, now) => {
    const atual = await trx(TABELA).where('id', r.id).first()
    if (atual.estado !== 'gerando' || atual.dono_lease !== r.dono_lease || Number(atual.lease_ate_ms) <= now)
        throw criarErro(409, 'A solicitação não está mais ativa.', atual.codigo_erro || 'REQUISICAO_INATIVA')
    const data = new Date(now)
    const [idUsuario] = await trx('tbl_mensagem').insert({ id_chat: r.id_chat, conteudo: r.pergunta, papel: 1, data_envio: data })
    const [idAssistente] = await trx('tbl_mensagem').insert({ id_chat: r.id_chat, conteudo: texto, papel: 2, data_envio: data })
    await trx(TABELA).where('id', r.id).update({ estado: 'concluida', chat_ativo: null,
        id_mensagem_usuario: idUsuario, id_mensagem_assistente: idAssistente })
    return { ...atual, estado: 'concluida', id_mensagem_usuario: idUsuario, id_mensagem_assistente: idAssistente }
})

const finalizar = (r, estado, codigo, status = 409, retryAfter = null) => transacao(r.id_usuario, r.id_chat, async (trx) => {
    // Compare-and-swap impede cancelamento/falha tardia de sobrescrever um commit confirmado.
    await trx(TABELA).where({ id: r.id, id_usuario: r.id_usuario, estado: 'gerando', dono_lease: r.dono_lease })
        .update({ estado, chat_ativo: null, codigo_erro: codigo, status_erro: status, retry_after: retryAfter })
    return trx(TABELA).where('id', r.id).first()
})

module.exports = { reservar, consultar, resultado, contexto, concluir, finalizar, LEASE_MS }
