const knex = require('knex')(require('../../Database_config_knex/KnexFile.js').development)
const tabela = 'tbl_simulacao_amortizacao'
const colunas = [
    'id',
    'nome',
    'descricao',
    'saldo_devedor',
    'prazo',
    'taxa',
    'sistema_calculo',
    'aporte_mensal',
    'modalidade',
    'data_criacao'
]

// O MySQL retorna DECIMAL como string; a API documenta esses campos como number.
const serializar = (simulacao) =>
    simulacao
        ? {
              ...simulacao,
              saldo_devedor: Number(simulacao.saldo_devedor),
              taxa: Number(simulacao.taxa),
              aporte_mensal: Number(simulacao.aporte_mensal)
          }
        : null

const listarSimulacoesAmortizacao = async (usuarioId, { pagina, tamanho }) => {
    const registros = await knex(tabela)
        .select(colunas)
        .where({ id_usuario: usuarioId })
        .orderBy('id', 'desc')
        .limit(tamanho)
        .offset((pagina - 1) * tamanho)
    return registros.map(serializar)
}

const consultarSimulacaoAmortizacao = async (simulacaoId, usuarioId) =>
    serializar(
        await knex(tabela).select(colunas).where({ id: simulacaoId, id_usuario: usuarioId }).first()
    )

const criarSimulacaoAmortizacao = async (usuarioId, dados) => {
    const [id] = await knex(tabela).insert({
        ...dados,
        id_usuario: usuarioId,
        data_criacao: knex.fn.now()
    })
    return consultarSimulacaoAmortizacao(id, usuarioId)
}

const atualizarSimulacaoAmortizacao = async (simulacaoId, usuarioId, dados) => {
    // Consultar depois do UPDATE também reconhece atualizações sem mudança de valor.
    await knex(tabela).where({ id: simulacaoId, id_usuario: usuarioId }).update(dados)
    return consultarSimulacaoAmortizacao(simulacaoId, usuarioId)
}

const removerSimulacaoAmortizacao = async (simulacaoId, usuarioId) => {
    const removidas = await knex(tabela).where({ id: simulacaoId, id_usuario: usuarioId }).del()
    return removidas > 0
}

module.exports = {
    listarSimulacoesAmortizacao,
    consultarSimulacaoAmortizacao,
    criarSimulacaoAmortizacao,
    atualizarSimulacaoAmortizacao,
    removerSimulacaoAmortizacao
}
