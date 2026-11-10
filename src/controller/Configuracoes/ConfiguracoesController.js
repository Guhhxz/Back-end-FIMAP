const config_message = require('../modulo/configMensagens.js');
const configuracoesModel = require('../../../model/DAO/Configuracoes/configuracoes.js');

// Valida se o ID do usuário é um número positivo
const idValido = (id) => Number.isInteger(id) && id > 0;

// Resposta padrão de erro
const responderErro = (res, cfg) =>
  res.status(cfg.status).json({ sucesso: false, mensagem: cfg.mensagem });

const postConfiguracoesById = async (req, res) => {
  const { idUsuario } = req.params;
  const configuracoes = req.body;

  if (!idValido(Number(idUsuario))) {
    return responderErro(res, config_message.ID_USUARIO_INVALIDO);
  }

  if (!configuracoes || Object.keys(configuracoes).length === 0) {
    return responderErro(res, config_message.CAMPOS_OBRIGATORIOS);
  }

  try {
    const configuracoesExistentes = await configuracoesModel.GetConfiguracoesById(idUsuario);

    if (configuracoesExistentes && configuracoesExistentes.length > 0) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Configurações já existem para este usuário.'
      });
    }

    const idConfiguracao = await configuracoesModel.InsertConfiguracoes(idUsuario, configuracoes);

    if (!idConfiguracao) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Não foi possível criar as configurações.'
      });
    }

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Configurações criadas com sucesso.',
      id: idConfiguracao
    });
  } catch (error) {
    console.error('Erro ao criar configurações:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao criar configurações.' });
  }
};

// Controller para buscar configurações por ID do usuário
const getConfiguracoesById = async (req, res) => {
  const { idUsuario } = req.params;

  if (!idValido(Number(idUsuario))) {
    return responderErro(res, config_message.ID_USUARIO_INVALIDO);
  }

  try {
    const configuracoes = await configuracoesModel.GetConfiguracoesById(idUsuario);

    if (!configuracoes || configuracoes.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Configurações não encontradas.' });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Configurações encontradas com sucesso.',
      configuracoes,
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao buscar configurações.' });
  }
};

// Controller para atualizar configurações por ID do usuário
const updateConfiguracoesById = async (req, res) => {
  const { idUsuario } = req.params;
  const configuracoes = req.body;

  if (!idValido(Number(idUsuario))) {
    return responderErro(res, config_message.ID_USUARIO_INVALIDO);
  }

  if (!configuracoes || Object.keys(configuracoes).length === 0) {
    return responderErro(res, config_message.CAMPOS_OBRIGATORIOS);
  }

  try {
    const rowsUpdated = await configuracoesModel.UpdateConfiguracoesById(idUsuario, configuracoes);

    if (rowsUpdated === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Configurações não encontradas para atualizar.' });
    }

    return res.status(200).json({ sucesso: true, mensagem: 'Configurações atualizadas com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao atualizar configurações.' });
  }
};

module.exports = {
  postConfiguracoesById,
  getConfiguracoesById,
  updateConfiguracoesById
};