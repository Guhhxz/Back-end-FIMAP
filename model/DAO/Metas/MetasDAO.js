const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Criar meta
const CreateMeta = async (meta) => {
    let sql = `insert into tbl_meta_financeira
        (nome, descricao, valor_inicio, valor_desejado, valor_total, data_alvo, status, id_categoria, id_usuario)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`

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
        'id_categoria',
        'id_usuario'
    ];

    const camposAtualizados = camposPermitidos.filter(
        (campo) => meta[campo] !== undefined
    );

    if (camposAtualizados.length === 0) {
        return false;
    }

    const set = camposAtualizados
        .map((campo) => `${campo} = ?`)
        .join(', ');

    const valores = camposAtualizados.map(
        (campo) => meta[campo]
    );

    const sql = `
        UPDATE tbl_meta_financeira
        SET ${set}
        WHERE id = ?
    `;

    try {
        const [result] = await knexConex.raw(sql, [
            ...valores,
            meta.id
        ]);

        return result.affectedRows > 0;

    } catch (error) {
        console.error('Erro ao atualizar meta:', error);
        return false;
    }
};

// Deletar meta
const DeleteMeta = async (meta) => {
    let sql = `delete from tbl_meta_financeira
        where id = ?`

    try {
        const [result] = await knexConex.raw(sql, [meta.id])

        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao deletar meta:', error)
        return false
    }
}

// Buscar todas as meta
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
            .orderBy('data_alvo', 'asc');

    } catch (error) {
        console.error('Erro ao listar metas do usuário:', error);
        return false;
    }
};

const GetAllCategoriasMeta = async (id_usuario, ) =>{
    try {
        return await knexConex('tbl_categoria_meta')
            .select(
                'id',
                'nome'
            )
            .where('id_usuario', id_usuario)
    } catch (error) {
        console.error('Erro ao listar categorias do usuário:', error)
        return false
    }
}

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
        .orderBy('data_alvo', 'asc');
    } catch (error) {
        console.error('Erro ao listar metas do usuário:', error)
        return false
    }
}


module.exports = {
    Createmeta,
    Updatemeta,
    Deletemeta,
    GetAllMetasUsuario,
    GetAllCategoriasMeta,
    GetMetaById
}
