const express = require('express')
const router = express.Router()
const autenticar = require('../middlewares/autorization.js')
const metasController = require('../controller/Metas/MetasController.js')

router.use(autenticar)
router.get('/categorias', metasController.listarCategoriasMeta)
router.get('/', metasController.listarMetas)
router.post('/', metasController.criarMeta)

module.exports = router
