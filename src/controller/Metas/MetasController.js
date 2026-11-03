const dao = require('../../../model/DAO/Metas/MetasDAO.js')

const statusValidos = ['em_andamento', 'concluida', 'atrasada', 'cancelada']
const enviarErro = (res, status, mensagem) => res.status(status).json({ sucesso: false, mensagem })
const idPositivo = (valor) => {
    const id = Number(valor)
    return Number.isSafeInteger(id) && id > 0 ? id : null
}
const usuarioAutenticado = (req) => idPositivo(
    req.usuario?.id ?? req.usuario?.id_usuario ?? req.user?.id ?? req.user?.id_usuario
)
const valorValido = (valor) => typeof valor === 'number' && Number.isFinite(valor) && valor >= 0 && valor <= 9999999999999.99

const listarCategoriasMeta = async (req, res) => {
    if (!usuarioAutenticado(req)) return enviarErro(res, 401, 'Usuário não autenticado.')
    try {
        return res.status(200).json(await dao.listarCategoriasMeta())
    } catch (error) {
        console.error('Erro ao listar categorias de meta:', error)
        return enviarErro(res, 500, 'Erro interno do servidor.')
    }
}

const listarMetas = async (req, res) => {
    const usuarioId = usuarioAutenticado(req)
    if (!usuarioId) return enviarErro(res, 401, 'Usuário não autenticado.')
    const { status, categoria_id: categoriaId } = req.query || {}
    const pagina = req.query?.pagina === undefined ? 1 : Number(req.query.pagina)
    const tamanho = req.query?.tamanho_pagina === undefined ? 20 : Number(req.query.tamanho_pagina)
    const categoria = categoriaId === undefined ? undefined : idPositivo(categoriaId)
    if ((status !== undefined && !statusValidos.includes(status)) ||
        (categoriaId !== undefined && !categoria) || !Number.isSafeInteger(pagina) || pagina < 1 ||
        !Number.isSafeInteger(tamanho) || tamanho < 1 || tamanho > 100 ||
        !Number.isSafeInteger((pagina - 1) * tamanho)) {
        return enviarErro(res, 422, 'Parâmetros de consulta inválidos.')
    }
    try {
        const metas = await dao.listarMetas(usuarioId, { status, categoriaId: categoria, pagina, tamanho })
        return res.status(200).json(metas)
    } catch (error) {
        console.error('Erro ao listar metas:', error)
        return enviarErro(res, 500, 'Erro interno do servidor.')
    }
}

const criarMeta = async (req, res) => {
    const usuarioId = usuarioAutenticado(req)
    if (!usuarioId) return enviarErro(res, 401, 'Usuário não autenticado.')
    const body = req.body
    if (!body || typeof body !== 'object' || Array.isArray(body) ||
        typeof body.nome !== 'string' || !body.nome.trim() || [...body.nome].length > 100 ||
        typeof body.valor_desejado !== 'number' || !Number.isFinite(body.valor_desejado) ||
        body.valor_desejado <= 0 || body.valor_desejado > 9999999999999.99 ||
        !idPositivo(body.categoria_id) ||
        (body.descricao !== undefined && body.descricao !== null && typeof body.descricao !== 'string') ||
        (body.valor_inicio !== undefined && !valorValido(body.valor_inicio)) ||
        (body.valor_total !== undefined && !valorValido(body.valor_total)) ||
        (body.status !== undefined && !statusValidos.includes(body.status)) ||
        (body.data_alvo !== undefined && body.data_alvo !== null &&
            (typeof body.data_alvo !== 'string' || Number.isNaN(Date.parse(body.data_alvo)))) ||
        (body.valor_inicio ?? 0) > body.valor_desejado) {
        return enviarErro(res, 422, 'Dados da meta inválidos.')
    }
    try {
        return res.status(201).json(await dao.criarMeta(usuarioId, body))
    } catch (error) {
        console.error('Erro ao criar meta:', error)
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW')
            return enviarErro(res, 422, 'Categoria de meta não encontrada.')
        return enviarErro(res, 500, 'Erro interno do servidor.')
    }
}

module.exports = { listarCategoriasMeta, listarMetas, criarMeta }