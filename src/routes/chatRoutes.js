const express = require("express");
const router = express.Router();

const ChatController = require("../controller/Chat/ChatController.js")


router.post("/iniciar-chat", ChatController.CriarChat);

router.get("/listar-chats/:id_usuario", ChatController.ListarChatsPorUsuario);
router.get("/listar-chat/:id_chat", ChatController.ListaPorId);
router.get("/listar-chats", ChatController.ListarTodosChats);

router.delete("/apagar-chat/:id_chat", ChatController.ApagarChat);

router.patch("/atualizar-nome-chat/:id_chat", ChatController.AtualizarNomeChat);

module.exports = router;