const knex = require('knex');
const knexConfig = require('../../Database_config_knex/KnexFile.js');
const knexConex = knex(knexConfig.development);

const CAMPOS_ATUALIZAVEIS = ['ultimo_uso', 'data_revogacao'];


// Criar sessão
const CreateSessao = async (sessao) => {
    const sql = `
        INSERT INTO tbl_sessao (
            refresh_token_hash,
            data_criacao,
            data_expiracao,
            ultimo_uso,
            data_revogacao,
            id_usuario,
            id_dispositivo
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        sessao.refresh_token_hash,
        sessao.data_criacao,
        sessao.data_expiracao,
        sessao.ultimo_uso,
        sessao.data_revogacao,
        sessao.id_usuario,
        sessao.id_dispositivo,
    ];

    try {
        const [result] = await knexConex.raw(sql, values);
        return result.insertId; // Retorna o ID da nova sessão
    } catch (error) {
        console.error('Erro ao criar sessão:', error);
        return null;
    }
};

// Buscar sessão pelo ID
const GetSessaoById = async (id) => {
    const sql = `
        SELECT * FROM tbl_sessao WHERE id = ?
    `;

    try {
        const [result] = await knexConex.raw(sql, [id]);
        return result[0] || null;
    } catch (error) {
        console.error('Erro ao buscar sessão por ID:', error);
        return null;
    }
};

// Atualizar sessão (parcial: apenas os campos enviados)
const UpdateSessao = async (sessao) => {
    const sets = [];
    const valores = [];

    for (const campo of CAMPOS_ATUALIZAVEIS) {
        if (sessao[campo] !== undefined) {
            sets.push(`${campo} = ?`);
            valores.push(sessao[campo]);
        }
    }

    if (sets.length === 0) return false;

    const sql = `
        UPDATE tbl_sessao
        SET ${sets.join(', ')}
        WHERE id = ?
    `;

    try {
        const [result] = await knexConex.raw(sql, [...valores, sessao.id]);
        return result.affectedRows > 0; // Retorna true se alguma linha foi afetada
    } catch (error) {
        console.error('Erro ao atualizar sessão:', error);
        return null;
    }
};

// Deletar sessão
const DeleteSessao = async (id) => {
    const sql = `
        DELETE FROM tbl_sessao WHERE id = ?
    `;

    try {
        const [result] = await knexConex.raw(sql, [id]);
        return result.affectedRows > 0; // Retorna true se alguma linha foi afetada
    } catch (error) {
        console.error('Erro ao deletar sessão:', error);
        return null;
    }
};

// Buscar todas as sessões
const GetAllSessoes = async () => {
    const sql = `
        SELECT * FROM tbl_sessao
    `;

    try {
        const [result] = await knexConex.raw(sql);
        return result;
    } catch (error) {
        console.error('Erro ao buscar todas as sessões:', error);
        return null;
    }
};

module.exports = {
    CreateSessao,
    GetSessaoById,
    UpdateSessao,
    DeleteSessao,
    GetAllSessoes,
};