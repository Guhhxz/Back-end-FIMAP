/*
 * PARA QUE SERVE: Limita a quantidade de perguntas feitas pelo mesmo IP.
 * QUANDO ENTRA EM AÇÃO: Entra nas rotas POST de geração, antes de chamar os controllers.
 * QUANDO FAZ DIFERENÇA: Faz diferença quando chegam muitas perguntas: devolve HTTP 429 em vez de chamar a IA.
 */

const { rateLimit } = require('express-rate-limit')

module.exports = rateLimit({
    windowMs: 60000,
    limit: 12,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { sucesso: false, codigo: 'CHAT_LIMITE_IP', mensagem: 'Limite de perguntas atingido. Tente novamente em um minuto.' }
})
