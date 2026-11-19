const express = require("express");
const router = express.Router();

const curtidaComentarioController = require('../../src/controller/Comunidade/Curtidas/Curtidas_comentario/curtidasComentariosController.js')
const curtidaPostController = require('../../src/controller/Comunidade/Curtidas/Curtidas_post/curtidasPostController.js')

router.post("/curtir-post", curtidaPostController.curtirPost)
router.post("/alternar-curtida-post", curtidaPostController.alternarCurtidaPost)

router.get("/verificar-curtida-post/:id_post", curtidaPostController.verificarCurtidaPost)
router.get("/quantidade-curtidas-post/:id_post", curtidaPostController.contarCurtidasPost)
router.get("/curtidas-post/:id_post", curtidaPostController.listarCurtidasPorPost)
router.get("/curtidas-post/usuario/:id_usuario", curtidaPostController.listarCurtidasPorUsuario)

router.delete("/descurtir-post/:id_post", curtidaPostController.descurtirPost)


// Curtida de comentario

router.post("/curtir-comentario", curtidaComentarioController.curtirComentario)
router.post("/alternar-curtida-comentario", curtidaComentarioController.alternarCurtidaComentario)

router.get("/verificar-curtida-comentario/:id_comentario", curtidaComentarioController.verificarCurtidaComentario)
router.get("/quantidade-curtidas-comentario/:id_comentario", curtidaComentarioController.contarCurtidasComentario)
router.get("/curtidas-comentario/:id_comentario", curtidaComentarioController.listarCurtidasPorComentario)
router.get("/curtidas-comentario/usuario/:id_usuario", curtidaComentarioController.listarCurtidasPorUsuario)

router.delete("/descurtir-comentario/:id_comentario", curtidaComentarioController.descurtirComentario)

module.exports = router