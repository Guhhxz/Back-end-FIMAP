const knex = require('knex');
const knexConfig = require('../../Database_config_knex/KnexFile.js');

const knexConex = knex(knexConfig.development);

const CreateComentario = async (comentarioData) => {
    const sql = 'insert into tbl_comentario (mensagem, data_criacao, id_post, id_usuario, id_comentario_pai) values (?, now(), ?, ?, ?)';

    try {
        const result = await knexConex.raw(sql, [
            comentarioData.mensagem,
            comentarioData.data_criacao,
            comentarioData.id_post,
            comentarioData.id_usuario, 
            comentarioData.id_comentario_pai

        ]);
        return result;
    } catch (error) {
        console.error('Erro ao criar comentário:', error);
        throw error;
    }
};

const DeleteComentario = async (idComentario) => {
    const sql = 'delete from tbl_comentario where id_comentario = ?';

    try {
        const result = await knexConex.raw(sql, [idComentario]);
        return result;
    } catch (error) {
        console.error('Erro ao deletar comentário:', error);
        throw error;
    }
};

const UpdateComentario = async (idComentario, comentarioData) => {
    const sql = 'update tbl_comentario set mensagem = ? where id_comentario = ?';

    try {
        const result = await knexConex.raw(sql, [
            comentarioData.mensagem,
            idComentario
        ]);
        return result;
    } catch (error) {
        console.error('Erro ao atualizar comentário:', error);
        throw error;
    }
};

module.exports = {
    CreateComentario,
    DeleteComentario
};