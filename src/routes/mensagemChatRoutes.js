/*
 * PARA QUE SERVE: Liga os endereços de envio e consulta de mensagens às funções do controller.
 * QUANDO ENTRA EM AÇÃO: Entra quando chega um pedido em /v1/ia/chats/:chatId/mensagens ou no alias singular.
 * QUANDO FAZ DIFERENÇA: Faz diferença para o Express encontrar quem deve atender cada GET ou POST.
 */

const express = require('express')
const controller = require('../controller/MensagemChat/MensagemChatController.js')
const router = express.Router()
router.use(require('../middlewares/autorization.js'))

// GET apenas consulta; POST gera uma resposta e passa pelo limite de uso.
router.get('/:chatId/mensagens', controller.listarMensagensChat)
router.post('/:chatId/mensagens', controller.enviarMensagemChat)

module.exports = router
