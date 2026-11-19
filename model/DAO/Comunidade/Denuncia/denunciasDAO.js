// Import da biblioteca knex, utilizada para facilitar a comunicação com o banco de dados MySQL
const knex = require('knex')

// Import do arquivo de configuração que contém as credenciais e parâmetros de conexão com o banco
const knexConfig = require('../../../Database_config_knex/KnexFile.js')

// Cria a conexão com o banco de dados utilizando as configurações do ambiente "development"
const knexConex = knex(knexConfig.development)

const CreateDenuncia = async (denuncia) => {
    const sql = `insert into tbl_denuncia
        (titulo, descricao, data_criacao, id_usuario, id_post, id_categoria)
        values (?, ?, now(), ?, ?, ?)`

    try {
        const result = await knexConex.raw(sql, [
            denuncia.titulo,
            denuncia.descricao,
            denuncia.id_usuario,
            denuncia.id_post,
            denuncia.id_categoria
        ])

        return result?.[0]?.insertId || false
    } catch (error) {
        // Duplicada ou usuário/post/categoria inexistente é tratado pelo controller
        // (validação), sem log de erro
        if (error.code !== 'ER_DUP_ENTRY' && error.code !== 'ER_NO_REFERENCED_ROW_2') {
            console.error('Erro ao criar denúncia:', error)
        }

        return false
    }
}

// Buscar denúncia pelo ID
const GetDenunciaById = async (id_denuncia) => {
    const sql = `select * from tbl_denuncia where id = ?`

    try {
        const result = await knexConex.raw(sql, [id_denuncia])
        return result?.[0]?.[0] || null
    } catch (error) {
        console.error('Erro ao buscar denúncia por ID:', error)
        return null
    }
}

// Buscar a denúncia de um usuário em um post (ou null se ele não denunciou)
const GetDenunciaByUsuarioPost = async (id_usuario, id_post) => {
    const sql = `select * from tbl_denuncia where id_usuario = ? and id_post = ?`

    try {
        const result = await knexConex.raw(sql, [id_usuario, id_post])
        return result?.[0]?.[0] || null
    } catch (error) {
        console.error('Erro ao buscar denúncia do usuário no post:', error)
        return null
    }
}

// Buscar todas as denúncias (mais recentes primeiro)
const GetAllDenuncias = async () => {
    const sql = `select * from tbl_denuncia order by data_criacao desc`

    try {
        const result = await knexConex.raw(sql)
        return result?.[0] || []
    } catch (error) {
        console.error('Erro ao buscar todas as denúncias:', error)
        return false
    }
}

// Buscar as denúncias de um post (mais recentes primeiro)
const GetDenunciasByIdPost = async (id_post) => {
    const sql = `select * from tbl_denuncia
        where id_post = ?
        order by data_criacao desc`

    try {
        const result = await knexConex.raw(sql, [id_post])
        return result?.[0] || []
    } catch (error) {
        console.error('Erro ao buscar denúncias do post:', error)
        return false
    }
}

// Buscar as denúncias feitas por um usuário (mais recentes primeiro)
const GetDenunciasByIdUsuario = async (id_usuario) => {
    const sql = `select * from tbl_denuncia
        where id_usuario = ?
        order by data_criacao desc`

    try {
        const result = await knexConex.raw(sql, [id_usuario])
        return result?.[0] || []
    } catch (error) {
        console.error('Erro ao buscar denúncias do usuário:', error)
        return false
    }
}

// Buscar as denúncias de uma categoria (mais recentes primeiro)
const GetDenunciasByIdCategoria = async (id_categoria) => {
    const sql = `select * from tbl_denuncia
        where id_categoria = ?
        order by data_criacao desc`

    try {
        const result = await knexConex.raw(sql, [id_categoria])
        return result?.[0] || []
    } catch (error) {
        console.error('Erro ao buscar denúncias da categoria:', error)
        return false
    }
}

// Atualizar denúncia (somente os campos enviados) do próprio autor.
// Só titulo, descricao e id_categoria podem mudar; usuário e post não.
// Retorna true se atualizou, false se não encontrou, não é do usuário ou deu erro.
const UpdateDenuncia = async (denuncia) => {
    try {
        const campos = {
            titulo: denuncia.titulo,
            descricao: denuncia.descricao,
            id_categoria: denuncia.id_categoria
        }

        const atualizacoes = []
        const valores = []

        Object.entries(campos).forEach(([campo, valor]) => {
            if (valor !== undefined) {
                atualizacoes.push(`${campo} = ?`)
                valores.push(valor)
            }
        })

        if (atualizacoes.length === 0) {
            return false
        }

        // Nomes das colunas vêm do objeto fixo acima, nunca do cliente
        const sql = `update tbl_denuncia set ${atualizacoes.join(', ')}
            where id = ? and id_usuario = ?`
        valores.push(denuncia.id, denuncia.id_usuario)

        const result = await knexConex.raw(sql, valores)

        const afetados = result?.[0]?.affectedRows ?? 0
        return afetados > 0
    } catch (error) {
        console.error('Erro ao atualizar denúncia:', error)
        return false
    }
}

// Deletar denúncia do próprio autor (exclusão física).
// Obs.: apagar a denúncia NÃO reexibe um post que o trigger já ocultou.
const DeleteDenuncia = async (id_denuncia, id_usuario) => {
    const sql = `delete from tbl_denuncia where id = ? and id_usuario = ?`

    try {
        const result = await knexConex.raw(sql, [id_denuncia, id_usuario])
        return result?.[0]?.affectedRows > 0
    } catch (error) {
        console.error('Erro ao deletar denúncia:', error)
        return false
    }
}

module.exports = {
    CreateDenuncia,
    GetDenunciaById,
    GetDenunciaByUsuarioPost,
    GetAllDenuncias,
    GetDenunciasByIdPost,
    GetDenunciasByIdUsuario,
    GetDenunciasByIdCategoria,
    UpdateDenuncia,
    DeleteDenuncia
}