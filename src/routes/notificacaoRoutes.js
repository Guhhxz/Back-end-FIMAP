const express = require("express")
const router = express.Router()

const notificacaoController = require("../controller/Notificacao/notificacaoController.js")

router.post('/criar', notificacaoController.criarNotificacao)

router.get('/usuarios/:id_usuario/notificacoes', notificacaoController.buscarNotificacoesUsuario)
router.get('/:id_notificacao', notificacaoController.buscarNotificacaoPorId)
router.get('/usuarios/:id_usuario/notificacoes/nao-lidas', notificacaoController.buscarTodasNaolidas)
router.get('/usuarios/:id_usuario/notificacoes/lidas', notificacaoController.buscarTodaslidas)

router.patch('/usuarios/:id_usuario/notificacoes/lidas', notificacaoController.marcarTodasComoLidas)
router.patch('/:id_notificacao/lida', notificacaoController.marcarComoLida)

router.delete('/:id_notificacao', notificacaoController.deletarNotificacao)

module.exports = router
