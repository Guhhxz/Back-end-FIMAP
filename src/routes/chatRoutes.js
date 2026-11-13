/*
 * PARA QUE SERVE: Liga os endereços de criação e manutenção dos chats ao ChatController.
 * QUANDO ENTRA EM AÇÃO: Entra nos pedidos que começam com /v1/ia/chat.
 * QUANDO FAZ DIFERENÇA: Faz diferença para manter as rotas existentes e também oferecer o alias de mensagens.
 */

const express = require("express");
const router = express.Router();

const ChatController = require("../controller/Chat/ChatController.js")


router.post("/iniciar-chat", ChatController.CriarChat);

router.get("/listar-chats/:id_usuario", ChatController.ListarChatsPorUsuario);
router.get("/listar-chat/:id_chat", ChatController.ListaPorId);
router.get("/listar-chats", ChatController.ListarTodosChats);

router.delete("/apagar-chat/:id_chat", ChatController.ApagarChat);

router.patch("/atualizar-nome-chat/:id_chat", ChatController.AtualizarNomeChat);

// Alias singular para os endpoints de mensagens.
router.use(require("./mensagemChatRoutes.js"));

module.exports = router;