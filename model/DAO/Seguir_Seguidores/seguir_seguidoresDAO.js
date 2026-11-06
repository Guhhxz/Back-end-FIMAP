const knex = require('knex')
const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Convenção: id_seguidor = quem SEGUE | id_seguindo = quem É SEGUIDO

// Seguir um usuário
// Ex: usuário 5 segue o usuário 12 -> createSeguir({ id_seguidor: 5, id_seguindo: 12 })
const createSeguir = async (seguir) => {
    // Não permite seguir a si mesmo
    if (Number(seguir.id_seguidor) === Number(seguir.id_seguindo)) {
        return false
    }

    const sql = `insert into tbl_seguidores (id_seguidor, id_seguindo) values (?, ?)`

    try {
        const result = await knexConex.raw(sql, [
            seguir.id_seguidor,
            seguir.id_seguindo
        ])

        return result?.[0]?.insertId || false
    } catch (error) {
        // Já segue (violação do UNIQUE id_seguidor + id_seguindo)
        if (error.code === 'ER_DUP_ENTRY') {
            return false
        }

        console.error('Erro ao criar seguir:', error)
        return false
    }
}

// Deixar de seguir um usuário
// Ex: usuário 5 para de seguir o usuário 12 -> deleteSeguir(5, 12)
const deleteSeguir = async (id_seguidor, id_seguindo) => {
    const sql = `delete from tbl_seguidores where id_seguidor = ? and id_seguindo = ?`

    try {
        const result = await knexConex.raw(sql, [id_seguidor, id_seguindo])
        return result?.[0]?.affectedRows > 0
    } catch (error) {
        console.error('Erro ao deixar de seguir:', error)
        return false
    }
}

// Seguidores de um usuário (quem segue ele), com dados de cada um
const getSeguidoresByUsuarioId = async (id_usuario) => {
    const sql = `select u.nome_exibicao, u.username_social, u.foto_perfil
        from tbl_seguidores s
        join tbl_usuario u on u.id = s.id_seguidor
        where s.id_seguindo = ?`

    try {
        const result = await knexConex.raw(sql, [id_usuario])
        return result?.[0] || []
    } catch (error) {
        console.error('Erro ao buscar seguidores:', error)
        return false
    }
}

// Quem o usuário está seguindo, com dados de cada um
const getSeguindoByUsuarioId = async (id_usuario) => {
    const sql = `select u.nome_exibicao, u.username_social, u.foto_perfil
        from tbl_seguidores s
        join tbl_usuario u on u.id = s.id_seguindo
        where s.id_seguidor = ?`

    try {
        const result = await knexConex.raw(sql, [id_usuario])
        return result?.[0] || []
    } catch (error) {
        console.error('Erro ao buscar seguindo:', error)
        return false
    }
}


module.exports = {
    createSeguir,
    deleteSeguir,
    getSeguidoresByUsuarioId,
    getSeguindoByUsuarioId

}