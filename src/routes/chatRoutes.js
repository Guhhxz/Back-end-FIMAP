const express = require("express");
const router = express.Router();

const ChatController = require("../controller/Chat/ChatController.js")
const mensagens = require('../controller/MensagemChat/MensagemChatController.js')

router.post("/iniciar-chat/:id_usuario", ChatController.CriarChat);

router.get("/listar-chats/:id_usuario", ChatController.ListarChatsPorUsuario);
router.get("/listar-chat/:id_chat/:id_usuario", ChatController.ListaPorId);
router.get('/listar-chat/:id_chat/mensagens/:id_usuario', mensagens.listarMensagensChat);
router.post('/mensagens', mensagens.enviarMensagemChat);
router.get('/requisicoes/:requisicaoId/:id_usuario', mensagens.consultarRequisicao);
router.post('/requisicoes/:requisicaoId/cancelar/:id_usuario', mensagens.cancelarRequisicao);

router.delete("/apagar-chat/:id_chat/:id_usuario", ChatController.ApagarChat);

router.patch("/atualizar-nome-chat/:id_chat/:id_usuario", ChatController.AtualizarNomeChat);

router.use(require("./mensagemChatRoutes.js"));

module.exports = router;