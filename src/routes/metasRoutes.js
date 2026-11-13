const express = require("express")
const router = express.Router()

const MetaController = require("../controller/Metas/MetasController.js")


// CRUD de metas
router.post('/:id_usuario', MetaController.CriarMeta)
router.put('/:id_usuario/:id', MetaController.AtualizarMeta)
router.delete('/:id_usuario/:id', MetaController.DeletarMeta)
router.post('/categorias/:id_usuario', MetaController.CriarCategoria)

// Consultas
router.get('/:id_usuario', MetaController.ListarMetasUsuario)
router.get('/categorias/:id_usuario', MetaController.ListarCategoriasMeta)
router.get('/:id_usuario/:id', MetaController.BuscarMetaPorId)

module.exports = router