const express = require('express')
const router = express.Router()
const autenticar = require('../middlewares/autorization.js')
const metasController = require('../controller/Metas/MetasController.js')

router.use(autenticar)
router.get('/categorias', metasController.listarCategoriasMeta)
router.get('/', metasController.listarMetas)
router.post('/', metasController.criarMeta)
router.get('/:id', metasController.buscarMeta)
router.patch('/:id', metasController.atualizarMeta)
router.delete('/:id', metasController.excluirMeta)

module.exports = router
