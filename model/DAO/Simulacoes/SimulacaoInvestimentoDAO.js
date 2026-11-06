const knex = require('knex')(require('../../Database_config_knex/KnexFile.js').development)

const tabela = 'tbl_simulacao_investimento'
const colunas = [
    'id',
    'nome',
    'descricao',
    'valor_inicial',
    'aporte_mensal',
    'prazo',
    'rentabilidade',
    'data_criacao'
]

// O MySQL retorna DECIMAL como string; a API entrega números no JSON.
const serializar = (simulacao) =>
    simulacao
        ? {
              ...simulacao,
              valor_inicial: Number(simulacao.valor_inicial),
              aporte_mensal: Number(simulacao.aporte_mensal),
              rentabilidade: Number(simulacao.rentabilidade)
          }
        : null

const listarSimulacoesInvestimento = async (usuarioId, { pagina, tamanho }) => {
    const simulacoes = await knex(tabela)
        .select(colunas)
        .where({ id_usuario: usuarioId })
        .orderBy('id', 'desc')
        .limit(tamanho)
        .offset((pagina - 1) * tamanho)
    return simulacoes.map(serializar)
}

const consultarSimulacaoInvestimento = async (simulacaoId, usuarioId) =>
    serializar(
        await knex(tabela)
            .select(colunas)
            .where({ id: simulacaoId, id_usuario: usuarioId })
            .first()
    )

const criarSimulacaoInvestimento = async (usuarioId, dados) => {
    const [id] = await knex(tabela).insert({
        ...dados,
        id_usuario: usuarioId,
        data_criacao: knex.fn.now()
    })
    return consultarSimulacaoInvestimento(id, usuarioId)
}

const atualizarSimulacaoInvestimento = async (simulacaoId, usuarioId, dados) => {
    await knex(tabela).where({ id: simulacaoId, id_usuario: usuarioId }).update(dados)
    return consultarSimulacaoInvestimento(simulacaoId, usuarioId)
}

const removerSimulacaoInvestimento = async (simulacaoId, usuarioId) => {
    const removidas = await knex(tabela)
        .where({ id: simulacaoId, id_usuario: usuarioId })
        .del()
    return removidas > 0
}

module.exports = {
    listarSimulacoesInvestimento,
    consultarSimulacaoInvestimento,
    criarSimulacaoInvestimento,
    atualizarSimulacaoInvestimento,
    removerSimulacaoInvestimento
}