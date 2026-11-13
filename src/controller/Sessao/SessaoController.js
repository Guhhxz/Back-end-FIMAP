const SessaoDAO = require('../../../model/DAO/Sessao/SessaoDAO');
const messages = require('../../controller/modulo/configMensagens.js')

// Criar sessão
const criarSessao = async (req, res) => {
    try {
        const sessao = req.body;
        const id = await SessaoDAO.CreateSessao(sessao);
        res.status(201).json({ message: messages.success.sessionCreated, id });
    } catch (error) {
        console.error('Erro ao criar sessão:', error);
        res.status(500).json({ error: messages.error.sessionCreateError });
    }
};

// Obter sessão por ID
const obterSessaoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const sessao = await SessaoDAO.GetSessaoById(id);
        if (!sessao) {
            return res.status(404).json({ error: messages.error.sessionNotFound });
        }
        res.status(200).json({ message: messages.success.sessionFetched, sessao });
    } catch (error) {
        console.error('Erro ao obter sessão por ID:', error);
        res.status(500).json({ error: messages.error.sessionFetchError });
    }
};

// Atualizar último uso da sessão
const atualizarUltimoUso = async (req, res) => {
    try {
        const { id } = req.params;
        const { ultimoUso } = req.body;
        const sucesso = await SessaoDAO.UpdateSessao({ id, ultimo_uso: ultimoUso });
        if (!sucesso) {
            return res.status(404).json({ error: messages.error.sessionNotFound });
        }
        res.status(200).json({ message: messages.success.sessionUpdated });
    } catch (error) {
        console.error('Erro ao atualizar último uso da sessão:', error);
        res.status(500).json({ error: messages.error.sessionUpdateError });
    }
};

// Revogar sessão
const revogarSessao = async (req, res) => {
    try {
        const { id } = req.params;
        const { dataRevogacao } = req.body;
        const sucesso = await SessaoDAO.UpdateSessao({ id, data_revogacao: dataRevogacao });
        if (!sucesso) {
            return res.status(404).json({ error: messages.error.sessionNotFound });
        }
        res.status(200).json({ message: messages.success.sessionRevoked });
    } catch (error) {
        console.error('Erro ao revogar sessão:', error);
        res.status(500).json({ error: messages.error.sessionRevokeError });
    }
};

// Deletar sessão
const deletarSessao = async (req, res) => {
    try {
        const { id } = req.params;
        const sucesso = await SessaoDAO.DeleteSessao(id);
        if (!sucesso) {
            return res.status(404).json({ error: messages.error.sessionNotFound });
        }
        res.status(200).json({ message: messages.success.sessionDeleted });
    } catch (error) {
        console.error('Erro ao deletar sessão:', error);
        res.status(500).json({ error: messages.error.sessionDeleteError });
    }
};

module.exports = {
    criarSessao,
    obterSessaoPorId,
    atualizarUltimoUso,
    revogarSessao,
    deletarSessao,
};