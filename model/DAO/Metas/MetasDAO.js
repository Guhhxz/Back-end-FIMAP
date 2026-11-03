const knex = require('knex')(require('../../Database_config_knex/KnexFile.js').development)

const categorias = 'tbl_categoria_meta'
const metas = 'tbl_meta_financeira'
const statusParaCodigo = { em_andamento: 1, concluida: 2, atrasada: 3, cancelada: 4 }
const codigoParaStatus = Object.fromEntries(Object.entries(statusParaCodigo).map(([status, codigo]) => [codigo, status]))

const serializar = (meta) => {
    if (!meta) return null
    const valorDesejado = Number(meta.valor_desejado)
    const valorTotal = Number(meta.valor_total)
    return {
        id: meta.id,
        nome: meta.nome,
        descricao: meta.descricao,
        valor_inicio: Number(meta.valor_inicio),
        valor_desejado: valorDesejado,
        valor_total: valorTotal,
        data_alvo: meta.data_alvo,
        status: codigoParaStatus[meta.status] || 'em_andamento',
        categoria_id: meta.id_categoria,
        categoria: meta.categoria_nome ? { id: meta.id_categoria, nome: meta.categoria_nome } : undefined,
        percentual_progresso: valorDesejado > 0 ? valorTotal / valorDesejado : 0
    }
}

const consultar = (usuarioId, id) => knex(metas)
    .leftJoin(`${categorias} as categoria`, 'categoria.id', `${metas}.id_categoria`)
    .select(`${metas}.id`, `${metas}.nome`, `${metas}.descricao`, `${metas}.valor_inicio`,
        `${metas}.valor_desejado`, `${metas}.valor_total`, `${metas}.data_alvo`,
        `${metas}.status`, `${metas}.id_categoria`, 'categoria.nome as categoria_nome')
    .where(`${metas}.id`, id)
    .andWhere(`${metas}.id_usuario`, usuarioId)
    .first()

const listarCategoriasMeta = () => knex(categorias).select('id', 'nome').orderBy('nome')

const listarMetas = async (usuarioId, filtros) => {
    const query = knex(metas)
        .leftJoin(`${categorias} as categoria`, 'categoria.id', `${metas}.id_categoria`)
        .select(`${metas}.id`, `${metas}.nome`, `${metas}.descricao`, `${metas}.valor_inicio`,
            `${metas}.valor_desejado`, `${metas}.valor_total`, `${metas}.data_alvo`,
            `${metas}.status`, `${metas}.id_categoria`, 'categoria.nome as categoria_nome')
        .where(`${metas}.id_usuario`, usuarioId)
    if (filtros.status) query.andWhere(`${metas}.status`, statusParaCodigo[filtros.status])
    if (filtros.categoriaId) query.andWhere(`${metas}.id_categoria`, filtros.categoriaId)
    const linhas = await query.orderBy(`${metas}.id`, 'desc')
        .limit(filtros.tamanho).offset((filtros.pagina - 1) * filtros.tamanho)
    return linhas.map(serializar)
}

const criarMeta = async (usuarioId, dados) => {
    const [id] = await knex(metas).insert({
        nome: dados.nome.trim(), descricao: dados.descricao ?? null,
        valor_inicio: dados.valor_inicio ?? 0, valor_desejado: dados.valor_desejado,
        valor_total: dados.valor_total ?? dados.valor_inicio ?? 0,
        data_alvo: dados.data_alvo ?? knex.fn.now(), status: statusParaCodigo[dados.status || 'em_andamento'],
        id_categoria: dados.categoria_id, id_usuario: usuarioId
    })
    return serializar(await consultar(usuarioId, id))
}

module.exports = { listarCategoriasMeta, listarMetas, criarMeta }
