/*
 * PARA QUE SERVE: Compartilha o acesso ao MySQL entre os DAOs de chats e mensagens.
 * QUANDO ENTRA EM AÇÃO: É carregado pelos DAOs; a conexão é usada quando eles fazem uma consulta.
 * QUANDO FAZ DIFERENÇA: Faz diferença para os dois DAOs reutilizarem o mesmo pool e a configuração do KnexFile.js.
 */

const knex = require('knex')
const config = require('./KnexFile.js')

// Compartilhada pelos DAOs de chats e mensagens.
module.exports = knex(config.development)
