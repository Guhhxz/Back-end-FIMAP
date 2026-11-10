
const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Criar meta
const CreateMeta = async (meta) => {
    const sql = `
        INSERT INTO tbl_meta_financeira
        (
            nome,
            descricao,
            valor_inicio,
            valor_desejado,
            valor_total,
            data_alvo,
            status,
            id_categoria,
            id_usuario
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    try {
        const [result] = await knexConex.raw(sql, [
            meta.nome,
            meta.descricao,
            meta.valor_inicio,
            meta.valor_desejado,
            meta.valor_total,
            meta.data_alvo,
            meta.status,
            meta.id_categoria,
            meta.id_usuario
        ])

        return result.insertId

    } catch (error) {
        console.error('Erro ao criar meta:', error)
        return false
    }
}

// Atualizar meta
const UpdateMeta = async (meta) => {
    const camposPermitidos = [
        'nome',
        'descricao',
        'valor_inicio',
        'valor_desejado',
        'valor_total',
        'data_alvo',
        'status',
        'id_categoria'
    ]

    const camposAtualizados = camposPermitidos.filter(
        (campo) => meta[campo] !== undefined
    )

    if (camposAtualizados.length === 0) {
        return false
    }

    const set = camposAtualizados
        .map((campo) => `${campo} = ?`)
        .join(', ')

    const valores = camposAtualizados.map(
        (campo) => meta[campo]
    )

    const sql = `
        UPDATE tbl_meta_financeira
        SET ${set}
        WHERE id = ?
        AND id_usuario = ?
    `

    try {
        const [result] = await knexConex.raw(sql, [
            ...valores,
            meta.id,
            meta.id_usuario
        ])

        return result.affectedRows > 0

    } catch (error) {
        console.error('Erro ao atualizar meta:', error)
        return false
    }
}

// Deletar meta
const DeleteMeta = async (meta) => {
    const sql = `
        DELETE FROM tbl_meta_financeira
        WHERE id = ?
        AND id_usuario = ?
    `

    try {
        const [result] = await knexConex.raw(sql, [
            meta.id,
            meta.id_usuario
        ])

        return result.affectedRows > 0

    } catch (error) {
        console.error('Erro ao deletar meta:', error)
        return false
    }
}

// Buscar todas as metas do usuário
const GetAllMetasUsuario = async (id_usuario) => {
    try {
        return await knexConex('tbl_meta_financeira')
            .select(
                'id',
                'nome',
                'descricao',
                'valor_inicio',
                'valor_desejado',
                'valor_total',
                'data_alvo',
                'status',
                'id_categoria'
            )
            .where('id_usuario', id_usuario)
            .orderBy('data_alvo', 'asc')

    } catch (error) {
        console.error('Erro ao listar metas do usuário:', error)
        return false
    }
}

// Buscar todas as categorias de metas do usuário
const GetAllCategoriasMeta = async (id_usuario) => {
    try {
        return await knexConex('tbl_categoria_meta')
            .select(
                'id',
                'nome'
            )

    } catch (error) {
        console.error('Erro ao listar categorias do usuário:', error)
        return false
    }
}

// Buscar meta específica do usuário
const GetMetaById = async (id_usuario, id_meta) => {
    try {
        return await knexConex('tbl_meta_financeira')
            .select(
                'id',
                'nome',
                'descricao',
                'valor_inicio',
                'valor_desejado',
                'valor_total',
                'data_alvo',
                'status',
                'id_categoria'
            )
            .where('id_usuario', id_usuario)
            .andWhere('id', id_meta)

    } catch (error) {
        console.error('Erro ao buscar meta do usuário:', error)
        return false
    }
}

module.exports = {
    CreateMeta,
    UpdateMeta,
    DeleteMeta,
    GetAllMetasUsuario,
    GetAllCategoriasMeta,
    GetMetaById
}
