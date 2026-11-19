const express = require("express");
const router = express.Router();

const postController = require("../controller/Comunidade/Post/postController.js");
const comentarioController = require('../../src/controller/Comunidade/Comentario/comentarioController.js');
const curtidaComentarioController = require('../../src/controller/Comunidade/Curtidas/Curtidas_comentario/curtidasComentariosController.js')
const curtidaPostController = require('../../src/controller/Comunidade/Curtidas/Curtidas_post/curtidasPostController.js')

// Post

router.post("/criar", postController.criarPost);


router.get("/buscar/post/:id_usuario", postController.listarPostsPorUsuario);
router.get("/inativos/:id_usuario", postController.listarPostsInativos);   // antes estava ":id_usuario" (sem a barra)
router.get("/buscar/:id_post", postController.buscarPostPorId);

router.patch("/atualizar/:id_post", postController.atualizarPost);
router.patch("/deletar/:id_post", postController.deletarPost);


// Comentarios

router.post("/comentar", comentarioController.criarComentario)


router.patch("/update-comentario/:id_comentario", comentarioController.atualizarComentario)


router.get("/buscar-comentarios/post/:id_post", comentarioController.listarComentariosPorPost)
router.get("/buscar-comentario/:id_comentario", comentarioController.buscarComentarioPorId)
router.get("/buscar-comentario/usuario/:id_usuario", comentarioController.listarComentariosPorUsuario)   // antes: ":id-usuario"
router.get("/buscar-respostas/:id_comentario", comentarioController.listarRespostas)

router.delete("/deletar-comentario/:id_comentario", comentarioController.deletarComentario)


// Curtida de post

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