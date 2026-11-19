const express = require("express");
const router = express.Router();


const postController = require("../controller/Comunidade/Post/postController.js");
// Post

router.post("/criar", postController.criarPost);


router.get("/buscar/post/:id_usuario", postController.listarPostsPorUsuario);
router.get("/inativos/:id_usuario", postController.listarPostsInativos);   // antes estava ":id_usuario" (sem a barra)
router.get("/buscar/:id_post", postController.buscarPostPorId);

router.patch("/atualizar/:id_post", postController.atualizarPost);
router.patch("/deletar/:id_post", postController.deletarPost);

module.exports = router
