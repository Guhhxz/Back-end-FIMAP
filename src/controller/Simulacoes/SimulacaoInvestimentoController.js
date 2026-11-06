const dao = require('../../../model/DAO/Simulacoes/SimulacaoInvestimentoDAO.js')

const campos = ['nome', 'descricao', 'valor_inicial', 'aporte_mensal', 'prazo', 'rentabilidade']
const erro = (res, status, mensagem) => res.status(status).json({ sucesso: false, mensagem })
const idPositivo = (valor) => {
    const id = Number(valor)
    return Number.isSafeInteger(id) && id > 0 ? id : null
}

const validarDados = (body, parcial = false) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null

    const dados = Object.fromEntries(
        campos.filter((campo) => Object.hasOwn(body, campo)).map((campo) => [campo, body[campo]])
    )
    if (!Object.keys(dados).length) return null

    for (const campo of campos) {
        const valor = dados[campo]
        if (valor === undefined) {
            if (!parcial && campo !== 'descricao') return null
            continue
        }

        if (campo === 'descricao') {
            if (valor !== null && (typeof valor !== 'string' || Buffer.byteLength(valor, 'utf8') > 65535)) return null
            continue
        }
        if (campo === 'nome') {
            if (typeof valor !== 'string' || !valor.trim() || [...valor].length > 45) return null
            continue
        }
        if (typeof valor !== 'number' || !Number.isFinite(valor)) return null
        if (campo === 'prazo') {
            if (!Number.isInteger(valor) || valor < 1 || valor > 2147483647) return null
        } else if (campo === 'rentabilidade') {
            if (Math.abs(valor) > 999.99) return null
        } else if (valor < 0 || valor > 9999999999999.99) {
            return null
        }
    }

    return dados
}

const executar = (operacao) => async (req, res) => {
    const usuarioId = idPositivo(
        req.usuario?.id ?? req.usuario?.id_usuario ?? req.user?.id ?? req.user?.id_usuario
    )
    if (!usuarioId) return erro(res, 401, 'Usuário não autenticado.')

    try {
        return await operacao(req, res, usuarioId)
    } catch (error) {
        console.error('Erro na simulação de investimento:', error)
        return erro(res, 500, 'Erro interno do servidor.')
    }
}

const listarSimulacoesInvestimento = executar(async (req, res, usuarioId) => {
    const pagina = idPositivo(req.query?.pagina ?? 1)
    const tamanho = idPositivo(req.query?.tamanho_pagina ?? 20)
    if (!pagina || !tamanho || tamanho > 100 || !Number.isSafeInteger((pagina - 1) * tamanho)) {
        return erro(res, 422, 'Parâmetros de paginação inválidos.')
    }
    const simulacoes = await dao.listarSimulacoesInvestimento(usuarioId, { pagina, tamanho })
    return res.status(200).json(simulacoes)
})

const criarSimulacaoInvestimento = executar(async (req, res, usuarioId) => {
    const dados = validarDados(req.body)
    if (!dados) return erro(res, 422, 'Dados da simulação inválidos.')
    const simulacao = await dao.criarSimulacaoInvestimento(usuarioId, dados)
    return res.status(201).json(simulacao)
})

const consultarSimulacaoInvestimento = executar(async (req, res, usuarioId) => {
    const id = idPositivo(req.params.simulacaoId)
    if (!id) return erro(res, 422, 'ID da simulação inválido.')
    const simulacao = await dao.consultarSimulacaoInvestimento(id, usuarioId)
    return simulacao ? res.status(200).json(simulacao) : erro(res, 404, 'Simulação não encontrada.')
})

const atualizarSimulacaoInvestimento = executar(async (req, res, usuarioId) => {
    const id = idPositivo(req.params.simulacaoId)
    const dados = validarDados(req.body, true)
    if (!id || !dados) return erro(res, 422, 'Dados da simulação inválidos.')
    const simulacao = await dao.atualizarSimulacaoInvestimento(id, usuarioId, dados)
    return simulacao ? res.status(200).json(simulacao) : erro(res, 404, 'Simulação não encontrada.')
})

const removerSimulacaoInvestimento = executar(async (req, res, usuarioId) => {
    const id = idPositivo(req.params.simulacaoId)
    if (!id) return erro(res, 422, 'ID da simulação inválido.')
    const removida = await dao.removerSimulacaoInvestimento(id, usuarioId)
    return removida ? res.status(204).send() : erro(res, 404, 'Simulação não encontrada.')
})

module.exports = {
    listarSimulacoesInvestimento,
    criarSimulacaoInvestimento,
    consultarSimulacaoInvestimento,
    atualizarSimulacaoInvestimento,
    removerSimulacaoInvestimento
}