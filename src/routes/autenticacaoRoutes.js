const express = require('express')
const router = express.Router()

const autenticacaoController = require('../controller/Autenticacao/autenticacaoController.js')

router.delete('/autenticacao/dispositivos/:dispositivoId', autenticacaoController.removerDispositivo)
router.post('/autenticacao/senha/alterar', autenticacaoController.alterarSenha)
router.post('/autenticacao/senha/recuperacao/solicitar', autenticacaoController.solicitarRecuperacaoSenha)
router.post('/autenticacao/senha/recuperacao/validar-codigo', autenticacaoController.validarCodigoRecuperacao)
router.post('/autenticacao/senha/recuperacao/redefinir', autenticacaoController.redefinirSenha)

module.exports = router
