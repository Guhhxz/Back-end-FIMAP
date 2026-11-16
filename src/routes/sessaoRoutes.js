const express = require('express');
const SessaoController = require('../controller/Sessao/SessaoController');

const router = express.Router();

router.post('/criar', SessaoController.criarSessao);
router.get('/:id', SessaoController.obterSessaoPorId);
router.patch('/:id/ultimo-uso', SessaoController.atualizarUltimoUso);
router.patch('/:id/revogar', SessaoController.revogarSessao);
router.delete('/:id', SessaoController.deletarSessao);

module.exports = router;