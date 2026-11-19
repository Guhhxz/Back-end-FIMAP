const express = require("express");
const router = express.Router();

const comentarioController = require('../../src/controller/Comunidade/Comentario/comentarioController.js');

router.post("/comentar", comentarioController.criarComentario)


router.patch("/update-comentario/:id_comentario", comentarioController.atualizarComentario)


router.get("/buscar-comentarios/post/:id_post", comentarioController.listarComentariosPorPost)
router.get("/buscar-comentario/:id_comentario", comentarioController.buscarComentarioPorId)
router.get("/buscar-comentario/usuario/:id_usuario", comentarioController.listarComentariosPorUsuario)   // antes: ":id-usuario"
router.get("/buscar-respostas/:id_comentario", comentarioController.listarRespostas)

router.delete("/deletar-comentario/:id_comentario", comentarioController.deletarComentario)

module.exports = router
