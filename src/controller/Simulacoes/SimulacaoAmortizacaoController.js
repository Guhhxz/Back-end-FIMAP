const dao = require('../../../model/DAO/Simulacoes/SimulacaoAmortizacaoDAO.js')
const campos = [
    'nome',
    'descricao',
    'saldo_devedor',
    'prazo',
    'taxa',
    'sistema_calculo',
    'aporte_mensal',
    'modalidade'
]
const erro = (res, status, mensagem) => res.status(status).json({ sucesso: false, mensagem })
const idPositivo = (valor) =>
    Number.isSafeInteger(Number(valor)) && Number(valor) > 0 ? Number(valor) : null

const validarDados = (body, parcial) => {
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
            if (
                valor !== null &&
                (typeof valor !== 'string' || Buffer.byteLength(valor, 'utf8') > 65535)
            )
                return null
        } else if (['nome', 'sistema_calculo', 'modalidade'].includes(campo)) {
            if (typeof valor !== 'string' || !valor.trim() || [...valor].length > 45) return null
        } else {
            if (typeof valor !== 'number' || !Number.isFinite(valor)) return null
            if (campo === 'prazo') {
                if (!Number.isInteger(valor) || valor < 1 || valor > 2147483647) return null
            } else if (campo === 'taxa') {
                if (Math.abs(valor) > 999.99) return null
            } else if (valor < 0 || valor > 9999999999999.99) return null
        }
    }
    return dados
}

// Centraliza autenticação e tratamento de erros para todas as operações.
const executar = (operacao) => async (req, res) => {
    const usuarioId = idPositivo(
        req.usuario?.id ?? req.usuario?.id_usuario ?? req.user?.id ?? req.user?.id_usuario
    )
    if (!usuarioId) return erro(res, 401, 'Usuário não autenticado.')
    try {
        return await operacao(req, res, usuarioId)
    } catch (error) {
        console.error('Erro na simulação de amortização:', error)
        return erro(res, 500, 'Erro interno do servidor.')
    }
}

const listarSimulacoesAmortizacao = executar(async (req, res, usuarioId) => {
    const pagina = idPositivo(req.query?.pagina ?? 1)
    const tamanho = idPositivo(req.query?.tamanho_pagina ?? 20)
    if (!pagina || !tamanho || tamanho > 100 || !Number.isSafeInteger((pagina - 1) * tamanho)) {
        return erro(res, 422, 'Parâmetros de paginação inválidos.')
    }
    return res
        .status(200)
        .json(await dao.listarSimulacoesAmortizacao(usuarioId, { pagina, tamanho }))
})

const criarSimulacaoAmortizacao = executar(async (req, res, usuarioId) => {
    const dados = validarDados(req.body, false)
    if (!dados) return erro(res, 422, 'Dados da simulação inválidos.')
    return res.status(201).json(await dao.criarSimulacaoAmortizacao(usuarioId, dados))
})

const consultarSimulacaoAmortizacao = executar(async (req, res, usuarioId) => {
    const id = idPositivo(req.params.simulacaoId)
    if (!id) return erro(res, 422, 'ID da simulação inválido.')
    const simulacao = await dao.consultarSimulacaoAmortizacao(id, usuarioId)
    return simulacao ? res.status(200).json(simulacao) : erro(res, 404, 'Simulação não encontrada.')
})

const atualizarSimulacaoAmortizacao = executar(async (req, res, usuarioId) => {
    const id = idPositivo(req.params.simulacaoId)
    const dados = validarDados(req.body, true)
    if (!id || !dados) return erro(res, 422, 'Dados da simulação inválidos.')
    const simulacao = await dao.atualizarSimulacaoAmortizacao(id, usuarioId, dados)
    return simulacao ? res.status(200).json(simulacao) : erro(res, 404, 'Simulação não encontrada.')
})

const removerSimulacaoAmortizacao = executar(async (req, res, usuarioId) => {
    const id = idPositivo(req.params.simulacaoId)
    if (!id) return erro(res, 422, 'ID da simulação inválido.')
    const removida = await dao.removerSimulacaoAmortizacao(id, usuarioId)
    return removida ? res.status(204).send() : erro(res, 404, 'Simulação não encontrada.')
})

module.exports = {
    listarSimulacoesAmortizacao,
    criarSimulacaoAmortizacao,
    consultarSimulacaoAmortizacao,
    atualizarSimulacaoAmortizacao,
    removerSimulacaoAmortizacao
}
